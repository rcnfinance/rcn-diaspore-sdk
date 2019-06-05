import {
  LoanManager,
  DebtEngine,
  Model,
  Cosigner,
} from '@jpgonzalezra/diaspore-contract-artifacts';
import { LoanManagerEvents, DebtEngineEvents } from '@jpgonzalezra/abi-wrappers';
import { BigNumber, providerUtils } from '@0x/utils';
import assert from './utils/assert';
import ContractFactory from './factories/contract_factory';
import TokenWrapperFactory  from './factories/token_wrapper_factory';
import LoanManagerWrapper from './contract_wrappers/components/web3/loan_manager_wrapper'
import RcnTokenWrapper from './contract_wrappers/tokens/rcn_token_wrapper'
import InstallmentsModelWrapper from './contract_wrappers/components/web3/installments_model_wrapper';
import DebtEngineWrapper from './contract_wrappers/components/web3/debt_engine_wrapper';
import OracleWrapper from './contract_wrappers/components/web3/oracle_wrapper';
import { ContractEventArg } from 'ethereum-types';
import { EventCallback, ContractEvents, SubscribeAsyncParams } from './types';
import { 
  RequestWithCallBackParams, 
  LendWithCallBackParams, 
  PayWithCallBackParams, 
  WithdrawParams,
  WithdrawPartialParams,
  ApproveRequestWithCallBackParams,
  DiasporeWeb3ConstructorParams 
} from './diaspore_api'
import { DiasporeAbstractAPI } from './diaspore_abstract_api'

/**
 * The DiasporeWeb3API class contains smart contract wrappers helpful to interact with rcn diaspore ecosystem.
 */
export class DiasporeWeb3API extends DiasporeAbstractAPI {

  /**
   * Instantiates a new DiasporeWeb3API instance.
   * @return  An instance of the DiasporeWeb3CostructorParams class.
   */
  public constructor(params: DiasporeWeb3ConstructorParams) {
    super(params)

    providerUtils.standardizeOrThrow(params.provider);
    if (params.diasporeRegistryAddress !== undefined) {
      assert.isETHAddressHex('diasporeRegistryAddress', params.diasporeRegistryAddress);
    }

    const artifactsArray = [
      LoanManager,
      DebtEngine,
      Model,
      Cosigner,
    ];

    artifactsArray.forEach(
      (artifact): void => {
        this.web3Wrapper.abiDecoder.addABI(artifact.abi);
      },
    );

    this.contractFactory = new ContractFactory(this.web3Wrapper, params.diasporeRegistryAddress);

    this.loanManagerWrapper = new LoanManagerWrapper(
      this.web3Wrapper,
      this.contractFactory.getLoanManagerContract()
    );
    this.tokenFactory = new TokenWrapperFactory(this.web3Wrapper, this.contractFactory);

    this.installmentModelWrapper = new InstallmentsModelWrapper(
      this.web3Wrapper,
      this.contractFactory.getInstallmentsModelContract()
    )

    this.debtEngineModelWrapper = new DebtEngineWrapper(
      this.web3Wrapper,
      this.contractFactory.getDebtEngineContract()
    )

    this.oracleWrapper = new OracleWrapper(
      this.web3Wrapper,
      this.contractFactory.getOracleContract()
    )

    this.rcnToken = new RcnTokenWrapper(this.web3Wrapper, this.contractFactory.getRcnTokenContract());   
  }

  public request = async (params: RequestWithCallBackParams) : Promise<string> => {
    
    const request = await this.createRequestLoanParam(params);
    await this.loanManagerWrapper.requestLoan(request);

    const subscribeParams = this.getSubscribeAsyncParams(LoanManagerEvents.Requested, params.callback );
    const subscription: string = await this.loanManagerWrapper.subscribeAsync(subscribeParams)
    return subscription;
  }

  public lend = async (params: LendWithCallBackParams) => {

    const oracleData: string = await this.oracleWrapper.getOracleData(DiasporeWeb3API.CURRENCY);
    const cosigner: string = DiasporeWeb3API.ADDRESS0;
    const cosignerLimit: BigNumber = new BigNumber(0);
    const cosignerData: string = '0x';

    const id: string = params.id;
    const value: BigNumber = params.value;
    const request = { 
      id,
      oracleData, 
      cosigner,
      cosignerLimit, 
      cosignerData
    }
    
    const spender: string = await this.loanManagerWrapper.address()
    const owner: string = await this.getAccount()
    const allowance: BigNumber = await this.rcnToken.allowance({ owner, spender })
    if (!allowance.isEqualTo(value)) { 
      throw new Error("Error sending tokens to borrower. ");
    }

    await this.loanManagerWrapper.lend(request);

    const subscribeParams = this.getSubscribeAsyncParams(LoanManagerEvents.Lent, params.callback );
    const subscription: string = await this.loanManagerWrapper.subscribeAsync(subscribeParams)
    return subscription;

  }

  public pay = async (params: PayWithCallBackParams) => {

    //TODO: MAKE

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Paid, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;
  }

  public payToken = async (params: PayWithCallBackParams) => {

    //TODO: MAKE

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Paid, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;
  }

  public withdraw = async (params: WithdrawParams) => {

    await this.debtEngineModelWrapper.withdraw(params.id, params.to)

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Withdrawn, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;

  }

  public withdrawPartial = async (params: WithdrawPartialParams) => {

    await this.debtEngineModelWrapper.withdrawPartial(params.id, params.to, params.amount)

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Withdrawn, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;

  }
  
  public approveRequest = async (params: ApproveRequestWithCallBackParams) => {
    await this.loanManagerWrapper.approveRequest(params.id);

    const subscribeParams = this.getSubscribeAsyncParams(LoanManagerEvents.Approved, params.callback );
    const subscription: string = await this.loanManagerWrapper.subscribeAsync(subscribeParams)
    return subscription
  }

  private getSubscribeAsyncParams(eventName: ContractEvents, callback: EventCallback<ContractEventArg>): SubscribeAsyncParams {
    const indexFilterValues = {};
    const isVerbose = false
    return { eventName, indexFilterValues, callback, isVerbose }
  }
}
