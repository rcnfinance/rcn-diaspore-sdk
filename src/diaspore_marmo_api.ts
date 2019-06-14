import {
    RequestParams,
    LendParams,
    PayParams,
    WithdrawParams,
    WithdrawPartialParams,
    ApproveRequestParams,
    DiasporeWeb3CostructorParams,
    GetBalanceParams
} from './diaspore_api'
import { BigNumber } from '@0x/utils';
import LoanManagerMarmoWrapper from './contract_wrappers/components/marmo/loan_manager_wrapper';
import { Wallet, Provider } from 'marmojs';
import assert from './utils/assert';
import { DiasporeAbstractAPI } from './diaspore_abstract_api';

/**
 * @param provider The Marmo3 provider
 * @param wallet The wallet for sign
 */
export interface DiasporeMarmoCostructorParams extends DiasporeWeb3CostructorParams {
    subProvider: Provider;
    wallet: Wallet;
}

export class DiasporeMarmoAPI extends DiasporeAbstractAPI {

    private address: string;
    /**
    * An instance of the LoanManagerWrapper class containing methods
   * for interacting with diaspore smart contract.
   */
    public loanManagerMarmoWrapper: LoanManagerMarmoWrapper;

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

        this.address = params.wallet.address

    }

    public request = async (params: RequestParams): Promise<string> => {
        const request = await this.createRequestLoanParam(params);
        const intentId: string = await this.loanManagerMarmoWrapper.requestLoan(request);
        return Promise.resolve<string>(intentId);
    }

    public lend = async (params: LendParams) => {
        const request = await this.createLendRequestParam(params);
        const intentId: string = await this.loanManagerMarmoWrapper.lend(request);
        return Promise.resolve<string>(intentId);
    }

    public pay = async (params: PayParams) => {
        //TODO: MAKE
    }

    public payToken = async (params: PayParams) => {
        //TODO: MAKE
    }

    public withdraw = async (params: WithdrawParams) => {
        const intentId = this.debtEngineModelWrapper.withdraw(params.id, params.to);
        return intentId; 
    }

    public withdrawPartial = async (params: WithdrawPartialParams) => {
        const intentId = await this.debtEngineModelWrapper.withdrawPartial(params.id, params.to, params.amount);
        return intentId; 

    }

    public approveRequest = async (params: ApproveRequestParams) => {
        const intentId = await this.loanManagerWrapper.approveRequest(params.id);
        return intentId;
    }

    /**
     * Get the account currently used by DiasporeMarmoAPI
     * @return Address string
     */
    public getAccount = async (): Promise<string> => {
        return Promise.resolve<string>(this.address);
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

}
