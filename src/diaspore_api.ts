import { BigNumber } from '@0x/utils';
import { EventCallback } from './types';
import { ContractEventArg } from 'ethereum-types';

export interface RequestParams {
    amount: BigNumber;
    borrower: string;
    salt: BigNumber;
    expiration: BigNumber;
    cuota: BigNumber;
    interestRate: BigNumber;
    installments: BigNumber;
    duration: BigNumber;
    timeUnit: number | BigNumber;
}

export interface RequestWithCallBackParams extends RequestParams {
    callback: EventCallback<ContractEventArg>;
}

export interface LendParams {
    id: string;
    value: BigNumber;
}

export interface LendWithCallBackParams extends LendParams {
    callback: EventCallback<ContractEventArg>;
}

/**
 * @param address (optional) Account address
 */
export interface GetBalanceParams {
    address?: string;
}

export interface GetTokensParams {
    amount: number;
    address?: string;
}

export interface PayParams {
    id: string;
    amount: BigNumber;
    origin: string;    
}

export interface PayWithCallBackParams extends PayParams {
    id: string;
    amount: BigNumber;
    origin: string;
    callback: EventCallback<ContractEventArg>;    
}

export interface WithdrawParams {
    id: string;
    to: string;
    callback: EventCallback<ContractEventArg>;
}

export interface WithdrawWithCallBackParams {
    callback: EventCallback<ContractEventArg>;
}

export interface WithdrawPartialParams extends WithdrawParams {
    amount: BigNumber;
}

export interface ApproveRequestParams {
    id: string;
}

export interface ApproveRequestWithCallBackParams extends ApproveRequestParams {
    callback: EventCallback<ContractEventArg>;
}

export interface DiasporeApi {

    request(params: RequestParams): Promise<string>

    approveRequest(params: ApproveRequestParams): void

    lend(params: LendParams): void

    pay(params: PayParams): void

    payToken(params: PayParams): void

    withdraw(params: WithdrawParams): void

    withdrawPartial(params: WithdrawPartialParams): void

    getAccount(): Promise<string>

    getBalance(params: GetBalanceParams): Promise<BigNumber>

    isTestnet(): Promise<boolean>

}