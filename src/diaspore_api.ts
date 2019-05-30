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
    callback: EventCallback<ContractEventArg>;
}

export interface LendParams {
    id: string;
    value: BigNumber;
    callback: EventCallback<ContractEventArg>;
}

export interface DiasporeApi {

    request(params: RequestParams): Promise<string>

    lend(params: LendParams): void

    getAccount(): Promise<string>


}