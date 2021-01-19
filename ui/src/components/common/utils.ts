import { DepositInfo } from "./damlTypes";

const vowels = ["a", "e", "i", "o", "u"];

export const indefiniteArticle = (word: string): string => {
  return vowels.includes(word[0].toLowerCase()) ? `an ${word}` : `a ${word}`;
};

type StringToDepositInfoArray = {
  [key: string]: DepositInfo[];
};

export const groupDeposits = (
  deposits: DepositInfo[]
): StringToDepositInfoArray => {
  return deposits.reduce((group, deposit) => {
    const label = deposit.contractData.account.provider;
    const existingValue = group[label] || [];

    return { ...group, [label]: [...existingValue, deposit] };
  }, {} as StringToDepositInfoArray);
};

const sumDepositArray = (deposits: DepositInfo[]): number =>
  deposits.reduce(
    (sum, val) => sum + Number(val.contractData.asset.quantity),
    0
  );

type StringToNumber = {
  [key: string]: number;
};

export const sumDeposits = (deposits: DepositInfo[]): StringToNumber => {
  const depositGroup = groupDeposits(deposits);

  return Object.entries(depositGroup).reduce(
    (acc, [label, deposits]) => ({
      ...acc,
      [label]: sumDepositArray(deposits),
    }),
    {} as StringToNumber
  );
};

export const depositSummary = (deposits: DepositInfo[]): string => {
  const depositSums = sumDeposits(deposits);

  return Object.entries(depositSums)
    .map(([label, total]) => `${label}: ${total}`)
    .join(", ");
};

export function countDecimals(value: number) {
  if (Math.floor(value) !== value)
    return value.toString().split(".")[1].length || 0;
  return 0;
}

export const formatAsCurrency = (value) => {
  if (isNaN(value)) value = 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
};
export const decimalToPercent = (price) => (1.0 - +price) * 100;

export const decimalToPercentString = (price) =>
  `${decimalToPercent(price ?? 1).toFixed(1)} %`;

export const daysBetween = (startDate: Date, endDate: Date) => {
  const oneDay = 1000 * 60 * 60 * 24;
  const start = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  const end = Date.UTC(
    startDate.getFullYear(),
    startDate.getMonth(),
    startDate.getDate()
  );
  const result = (start - end) / oneDay;
  if (isNaN(result)) return 0;
  else return result;
};

export const daysLeftFromDateString = (endDate) =>
  `${daysBetween(new Date(), endDate)} days left`;

export const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
