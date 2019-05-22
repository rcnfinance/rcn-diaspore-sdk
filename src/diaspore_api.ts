import {
  LoanManager,
  DebtEngine,
  Model,
  Cosigner,
} from '@jpgonzalezra/diaspore-contract-artifacts';
import { Response, LoanManagerEvents } from '@jpgonzalezra/abi-wrappers';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { BigNumber, providerUtils } from '@0x/utils';
import { Provider } from 'ethereum-types';
import assert from './utils/assert';
import ContractFactory from './factories/contract_factory';
import TokenWrapperFactory  from './factories/token_wrapper_factory';
import LoanManagerWrapper from './contract_wrappers/components/loan_manager_wrapper'
import RcnTokenWrapper from './contract_wrappers/tokens/rcn_token_wrapper'
import InstallmentsModelWrapper from './contract_wrappers/components/installments_model_wrapper';
import OracleWrapper from './contract_wrappers/components/oracle_wrapper';
import { ContractEventArg } from 'ethereum-types';
import { EventCallback } from './types';



/**
 * @param provider The web3 provider
 * @param diasporeRegistryAddress The registry contract address '0x...'
 */
export interface ApiConstructorParams {
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

export interface RequestParams {
  amount: BigNumber;
  borrower: string; 
  salt:BigNumber;
  expiration:BigNumber;
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
/**
 * The DiasporeAPI class contains smart contract wrappers helpful to interact with rcn diaspore ecosystem.
 */
export class DiasporeAPI {
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
   * Instantiates a new DiasporeAPI instance.
   * @return  An instance of the DiasporeAPI class.
   */
  public constructor(params: ApiConstructorParams) {
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
      throw new Error("request loan data is invalid");
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

    const eventName = LoanManagerEvents.Requested;
    const indexFilterValues = {};
    const callback = params.callback 
    const isVerbose = false
    const subscription: string = await this.loanManagerWrapper.subscribeAsync({ eventName, indexFilterValues, callback, isVerbose })
    return subscription;
  }

  /**
   * lend, this method execute oracleWrapper and loanManagerWrapper module
   * @return Address string
   */
  public lend = async (params: LendParams) => {

    const oracleData: string = await this.oracleWrapper.getOracleData("ARS");
    const cosigner: string = '0x0000000000000000000000000000000000000000';
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

    const eventName = LoanManagerEvents.Lent;
    const indexFilterValues = {};
    const callback = params.callback 
    const isVerbose = false
    const subscription: string = await this.loanManagerWrapper.subscribeAsync({ eventName, indexFilterValues, callback, isVerbose })
    return subscription;

  }

  /**
   * lend, this method execute oracleWrapper and loanManagerWrapper module
   * @return Address string
   */
  public approveRequest = async (id: string) => {
    return await this.loanManagerWrapper.approveRequest(id);
  }

  /**
   * Get the account currently used by DiasporeApi
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
}
