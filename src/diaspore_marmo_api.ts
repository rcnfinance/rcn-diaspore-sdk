import {
    PayParams,
    DiasporeWeb3CostructorParams,
    GetBalanceParams,
    RequestCallBackMarmoParams,
    LendWithCallBackMarmoParams,
    ApproveRequestWithCallBackMarmoParams,
    WithdrawPartialWithCallBackMarmoParams,
    WithdrawWithCallBackMarmoParams
} from './diaspore_api'
import { EventMarmoCallback } from './types';
import { BigNumber, addressUtils } from '@0x/utils';
import LoanManagerMarmoWrapper from './contract_wrappers/components/marmo/loan_manager_wrapper';
import DebtEngineMarmoWrapper from './contract_wrappers/components/marmo/debt_engine_model';
import { Wallet, Provider, Intent, IntentBuilder, WETH } from 'marmojs';
import assert from './utils/assert';
import { DiasporeAbstractAPI } from './diaspore_abstract_api';
import { StatusCode } from 'marmojs';

const setWait = (ms: any) => new Promise((r, j) => setTimeout(r, ms))

/**
 * @param provider The Marmo3 provider
 * @param wallet The wallet for sign
 */
export interface DiasporeMarmoCostructorParams extends DiasporeWeb3CostructorParams {
    subProvider: Provider;
    wallet: Wallet;
}

export class DiasporeMarmoAPI extends DiasporeAbstractAPI {

    subProvider: Provider;
    wallet: Wallet;
    /**
    * An instance of the LoanManagerWrapper class containing methods
   * for interacting with diaspore smart contract.
   */
    public loanManagerMarmoWrapper: LoanManagerMarmoWrapper;
    public debtEngineMarmoModelWrapper: DebtEngineMarmoWrapper;

    /**
      * Instantiates a new DiasporeMarmoAPI instance.
      * @return  An instance of the DiasporeMarmoCostructorParams class.
      */
    public constructor(params: DiasporeMarmoCostructorParams) {
        super(params)
        if (params.diasporeRegistryAddress !== undefined) {
            assert.isETHAddressHex('diasporeRegistryAddress', params.diasporeRegistryAddress);
        }

        this.loanManagerMarmoWrapper = new LoanManagerMarmoWrapper(
            this.loanManagerWrapper,
            this.contractFactory.getLoanManagerContractAddress(),
            params.wallet,
            params.subProvider
        );

        this.debtEngineMarmoModelWrapper = new DebtEngineMarmoWrapper(
            this.debtEngineModelWrapper,
            this.contractFactory.getDebtEngineContractAddress(),
            params.wallet,
            params.subProvider
        );

        this.subProvider = params.subProvider;
        this.wallet = params.wallet;

    }

    public request = async (params: RequestCallBackMarmoParams): Promise<string> => {
        const request = await this.createRequestLoanParam(params);
        const intentId: string = await this.loanManagerMarmoWrapper.requestLoan(request);
        this.subscribeAsync(intentId, params.callback)
        return Promise.resolve<string>(intentId);
    }

    public lend = async (params: LendWithCallBackMarmoParams) => {
        const request = await this.createLendRequestParam(params);
        const intentId: string = await this.loanManagerMarmoWrapper.lend(request);
        this.subscribeAsync(intentId, params.callback)
        return Promise.resolve<string>(intentId);
    }

    public pay = async (params: PayParams) => {
        //TODO: MAKE
    }

    public payToken = async (params: PayParams) => {
        //TODO: MAKE
    }

    public withdraw = async (params: WithdrawWithCallBackMarmoParams) => {
        const intentId: string = await this.debtEngineMarmoModelWrapper.withdraw(params.id, params.to);
        this.subscribeAsync(intentId, params.callback)
        return intentId;
    }

    public withdrawPartial = async (params: WithdrawPartialWithCallBackMarmoParams) => {
        const intentId: string = await this.debtEngineMarmoModelWrapper.withdrawPartial(params.id, params.to, params.amount);
        this.subscribeAsync(intentId, params.callback)
        return intentId;

    }

    public approveRequest = async (params: ApproveRequestWithCallBackMarmoParams) => {
        const intentId: string = await this.loanManagerMarmoWrapper.approveRequest(params.id);
        this.subscribeAsync(intentId, params.callback)
        return intentId;
    }

    /**
     * Get the account currently used by DiasporeMarmoAPI
     * @return Address string
     */
    public getAccount = async (): Promise<string> => {
        return Promise.resolve<string>(this.wallet.address);
    };

    /**
     * Get the ETH balance
     * @return Balance BigNumber
     */
    public getBalance = async (params: GetBalanceParams): Promise<BigNumber> => {
        const addr = params.address !== undefined ? params.address : await this.getAccount();
        assert.isETHAddressHex('address', addr);
        return this.web3Wrapper.getBalanceInWeiAsync(addr);
    };

    public getStatus = async (intentId: string): Promise<StatusCode> => {
        // FIXME: (WA)
        // there are that accept empty intent actions on marmojs
        const intentActionMock = new WETH(addressUtils.generatePseudoRandomAddress()).approve(addressUtils.generatePseudoRandomAddress(), "0");
        const intent: Intent = new IntentBuilder().withIntentAction(intentActionMock).build();
        const signedIntent = this.wallet.sign(intent);
        signedIntent.id = intentId; // Work araund
        return (await signedIntent.status(this.subProvider)).code;
    }

    /**
     * Private methods
     */

    //TODO: Refactor this method.
    private wait = async (predicate: () => Promise<boolean>, intentId: string, callback: EventMarmoCallback, timeout: number = 30, period = 1000) => {
        const mustEnd = Date.now() + timeout * period;
        while (Date.now() < mustEnd) {
            if (await predicate()) {
                //TODO: sent to receipt (add Status Object to marmojs)
                callback(null, (await this.getStatus(intentId)).toString())
                return true
            } else {
                await setWait(period)
            }
        }
        return false;
    }

    private subscribeAsync(intentId: string, callback?: EventMarmoCallback) {
        if (callback) {
            this.wait(async () => (await this.getStatus(intentId) === StatusCode.Settling), intentId, callback, 640)
        }
    }
}
