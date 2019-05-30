import {
  LoanManager,
  DebtEngine,
  Model,
  Cosigner,
} from '@jpgonzalezra/diaspore-contract-artifacts';
import { Response, LoanManagerEvents, DebtEngineEvents } from '@jpgonzalezra/abi-wrappers';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { BigNumber, providerUtils } from '@0x/utils';
import { Provider } from 'ethereum-types';
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
import { RequestParams, DiasporeApi, LendParams } from './diaspore_api'

/**
 * @param provider The web3 provider
 * @param diasporeRegistryAddress The registry contract address '0x...'
 */
export interface Web3DiasporeWeb3API {
  provider: Provider;
  diasporeRegistryAddress: string;
  defaultGasPrice?: BigNumber;
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
  callback: EventCallback<ContractEventArg>;
}

export interface WithdrawParams {
  id: string;
  to: string;
  callback: EventCallback<ContractEventArg>;
}

export interface WithdrawPartialParams extends WithdrawParams {
  amount: BigNumber;
}
/**
 * The DiasporeWeb3API class contains smart contract wrappers helpful to interact with rcn diaspore ecosystem.
 */
export class DiasporeWeb3API implements DiasporeApi {
  static readonly CURRENCY = 'ARS';
  static readonly ADDRESS0 = '0x0000000000000000000000000000000000000000';


  /**
   * An instance of the LoanManagerWrapper class containing methods
   * for interacting with diaspore smart contract.
   */
  public loanManagerWrapper: LoanManagerWrapper;
  /**
   * An instance of the InstallmentsModelWrapper class containing methods
   * for interacting with diaspore smart contract.
   */
  public installmentModelWrapper: InstallmentsModelWrapper;
  /**
   * An instance of the DebtEngineWrapper class containing methods
   * for interacting with diaspore smart contract.
   */
  public debtEngineModelWrapper: DebtEngineWrapper;
  /**
   * An instance of the OracleWrapper class containing methods
   * for interacting with diaspore smart contract.
   */
  public oracleWrapper: OracleWrapper;
  /**
   * An instance of the RcnTokenWrapper class containing methods
   * for interacting with RcnToken smart contract.
   */
  public rcnToken: RcnTokenWrapper;
  /**
   * An instance of the TokenWrapperFactory class to get
   * TokenWrapper instances to interact with ERC20 smart contracts
   */
  public tokenFactory: TokenWrapperFactory;
  /**
   * An instance of the ContractFactory class to get
   * contract instances to interact with smart contracts
   */
  private contractFactory: ContractFactory;
  /**
   * An instance of web3Wrapper
   */
  private readonly web3Wrapper: Web3Wrapper;

  /**
   * Instantiates a new DiasporeWeb3API instance.
   * @return  An instance of the DiasporeWeb3API class.
   */
  public constructor(params: Web3DiasporeWeb3API) {
    providerUtils.standardizeOrThrow(params.provider);
    if (params.diasporeRegistryAddress !== undefined) {
      assert.isETHAddressHex('diasporeRegistryAddress', params.diasporeRegistryAddress);
    }

    this.web3Wrapper = new Web3Wrapper(params.provider, {
      gasPrice: params.defaultGasPrice,
    });

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

  /**
   * request, this method execute loanManagerWrapper and installmentModelWrapper module
   * @return Address string
   */
  public request = async (params: RequestParams) : Promise<string> => {
    const model: string = await this.installmentModelWrapper.address();
    const oracle: string = await this.oracleWrapper.address();

    const data = await this.installmentModelWrapper.encodeData(
      params.cuota, 
      params.interestRate, 
      params.installments, 
      params.duration, 
      params.timeUnit
    );
    const isValid: boolean = await this.installmentModelWrapper.isValid(data);
    if (!isValid) {
      throw new Error("The request loan data is invalid");
    }

    const amount = params.amount;
    const borrower = params.borrower;
    const salt = params.salt;
    const expiration = params.expiration;
    await this.loanManagerWrapper.requestLoan({ 
      amount, 
      model, 
      oracle, 
      borrower, 
      salt, 
      expiration, 
      data
    });

    const subscribeParams = this.getSubscribeAsyncParams(LoanManagerEvents.Requested, params.callback );
    const subscription: string = await this.loanManagerWrapper.subscribeAsync(subscribeParams)
    return subscription;
  }

  /**
   * lend, this method execute oracleWrapper and loanManagerWrapper module
   * @return Address string
   */
  public lend = async (params: LendParams) => {

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

  /**
   * pay, this method execute debtEngineModelWrapper and oracleWrapper module
   * @return Address string
   */
  public pay = async (params: PayParams) => {

    //TODO: MAKE

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Paid, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;
  }

  /**
   * pay, this method execute debtEngineModelWrapper and oracleWrapper module
   * @return Address string
   */
  public payToken = async (params: PayParams) => {

    //TODO: MAKE

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Paid, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;
  }

  /**
   * withdraw, this method execute loanManagerWrapper module
   * @return Address string
   */
  public withdraw = async (params: WithdrawParams) => {

    await this.debtEngineModelWrapper.withdraw(params.id, params.to)

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Withdrawn, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;

  }

  /**
   * withdraw, this method execute loanManagerWrapper module
   * @return Address string
   */
  public withdrawPartial = async (params: WithdrawPartialParams) => {

    await this.debtEngineModelWrapper.withdrawPartial(params.id, params.to, params.amount)

    const subscribeParams = this.getSubscribeAsyncParams(DebtEngineEvents.Withdrawn, params.callback );
    const subscription: string = await this.debtEngineModelWrapper.subscribeAsync(subscribeParams)
    return subscription;

  }
  
  /**
   * lend, this method execute oracleWrapper and loanManagerWrapper module
   * @return Address string
   */
  public approveRequest = async (id: string, callback: EventCallback<ContractEventArg>) => {
    const subscribeParams = this.getSubscribeAsyncParams(LoanManagerEvents.Approved, callback );
    const subscription: string = await this.loanManagerWrapper.subscribeAsync(subscribeParams)
    await this.loanManagerWrapper.approveRequest(id);
    return subscription
  }

  /**
   * Get the account currently used by DiasporeWeb3API
   * @return Address string
   */
  public getAccount = async (): Promise<string> => {
    return (await this.web3Wrapper.getAvailableAddressesAsync())[0];
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

  /**
   * Is it Testnet network?
   */
  public isTestnet = async (): Promise<boolean> => {
    return (await this.web3Wrapper.getNetworkIdAsync()) !== 1;
  };

  private getSubscribeAsyncParams(eventName: ContractEvents, callback: EventCallback<ContractEventArg>): SubscribeAsyncParams {
    const indexFilterValues = {};
    const isVerbose = false
    return { eventName, indexFilterValues, callback, isVerbose }
  }
}
