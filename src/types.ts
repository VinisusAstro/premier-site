export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  participants: string[];
  date: Date;
}

export interface Balance {
  participant: string;
  amount: number;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}
