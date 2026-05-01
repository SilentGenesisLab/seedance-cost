type CreditApiItem = {
  account: string;
  exit_code: number;
  stdout: string;
  stderr: string;
  fetched_at: string;
};

type ParsedCreditStdout = {
  vip_credit: number;
  gift_credit: number;
  purchase_credit: number;
  total_credit: number;
};

export type CreditSnapshotInput = {
  accountName: string;
  exitCode: number;
  stdout: string;
  stderr: string;
  fetchedAt: Date;
  parsedCredit?: ParsedCreditStdout;
  anomalyReason?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readString(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === 'string' ? value : undefined;
}

function readNumber(record: Record<string, unknown>, key: string): number | undefined {
  const value = record[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function parseCreditItem(value: unknown): CreditApiItem | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const account = readString(value, 'account');
  const exitCode = readNumber(value, 'exit_code');
  const stdout = readString(value, 'stdout');
  const stderr = readString(value, 'stderr') ?? '';
  const fetchedAt = readString(value, 'fetched_at');

  if (!account || exitCode === undefined || stdout === undefined || !fetchedAt) {
    return undefined;
  }

  return {
    account,
    exit_code: exitCode,
    stdout,
    stderr,
    fetched_at: fetchedAt,
  };
}

function parseStdout(stdout: string): ParsedCreditStdout | undefined {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stdout);
  } catch {
    return undefined;
  }

  if (!isRecord(parsed)) {
    return undefined;
  }

  const vipCredit = readNumber(parsed, 'vip_credit');
  const giftCredit = readNumber(parsed, 'gift_credit');
  const purchaseCredit = readNumber(parsed, 'purchase_credit');
  const totalCredit = readNumber(parsed, 'total_credit');

  if (
    vipCredit === undefined ||
    giftCredit === undefined ||
    purchaseCredit === undefined ||
    totalCredit === undefined
  ) {
    return undefined;
  }

  return {
    vip_credit: vipCredit,
    gift_credit: giftCredit,
    purchase_credit: purchaseCredit,
    total_credit: totalCredit,
  };
}

export function parseCreditApiResponse(payload: unknown): CreditSnapshotInput[] {
  if (!isRecord(payload) || !Array.isArray(payload.credits)) {
    throw new Error('Credit API response must include credits array.');
  }

  return payload.credits.map((item, index) => {
    const creditItem = parseCreditItem(item);

    if (!creditItem) {
      return {
        accountName: `unknown-${index}`,
        exitCode: -1,
        stdout: JSON.stringify(item),
        stderr: '',
        fetchedAt: new Date(),
        anomalyReason: 'Invalid credit item shape',
      };
    }

    const fetchedAt = new Date(creditItem.fetched_at);
    const normalizedFetchedAt = Number.isNaN(fetchedAt.getTime()) ? new Date() : fetchedAt;

    if (creditItem.exit_code !== 0) {
      return {
        accountName: creditItem.account,
        exitCode: creditItem.exit_code,
        stdout: creditItem.stdout,
        stderr: creditItem.stderr,
        fetchedAt: normalizedFetchedAt,
        anomalyReason: `Non-zero exit code: ${creditItem.exit_code}`,
      };
    }

    const parsedCredit = parseStdout(creditItem.stdout);

    if (!parsedCredit) {
      return {
        accountName: creditItem.account,
        exitCode: creditItem.exit_code,
        stdout: creditItem.stdout,
        stderr: creditItem.stderr,
        fetchedAt: normalizedFetchedAt,
        anomalyReason: 'Failed to parse credit stdout',
      };
    }

    return {
      accountName: creditItem.account,
      exitCode: creditItem.exit_code,
      stdout: creditItem.stdout,
      stderr: creditItem.stderr,
      fetchedAt: normalizedFetchedAt,
      parsedCredit,
    };
  });
}
