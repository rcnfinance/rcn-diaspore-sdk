import {
  DiasporeAPI,
  DiasporeWeb3CostructorParams,
  WithdrawParams,
  WithdrawPartialParams,
  RequestParams,
  PayParams,
  LendParams,
  ApproveRequestParams,
  RequestLoanParams,
  GetBalanceParams
} from './diaspore_api'
import {
  LoanManager,
  DebtEngine,
  Model,
  Cosigner,
} from '@jpgonzalezra/diaspore-contract-artifacts';
import { BigNumber } from '@0x/utils';
import ContractFactory from './factories/contract_factory';
import TokenWrapperFactory from './factories/token_wrapper_factory';
import LoanManagerWrapper from './contract_wrappers/components/web3/loan_manager_wrapper'
import RcnTokenWrapper from './contract_wrappers/tokens/rcn_token_wrapper'
import InstallmentsModelWrapper from './contract_wrappers/components/web3/installments_model_wrapper';
import DebtEngineWrapper from './contract_wrappers/components/web3/debt_engine_wrapper';
import OracleWrapper from './contract_wrappers/components/common/oracle_wrapper';

import { Web3Wrapper } from '@0x/web3-wrapper';

/**
 * The DiasporeAbstractAPI abstract class contains abtract components.
 */
export abstract class DiasporeAbstractAPI implements DiasporeAPI {

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
  protected contractFactory: ContractFactory;
  /**
   * An instance of web3Wrapper
   */
  protected web3Wrapper: Web3Wrapper;

  /**
   * Instantiates a new DiasporeWeb3API instance.
   * @return  An instance of the DiasporeWeb3CostructorParams class.
   */
  public constructor(params: DiasporeWeb3CostructorParams) {

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
      this.contractFactory.getOracleContract()
    )

    this.rcnToken = new RcnTokenWrapper(this.web3Wrapper, this.contractFactory.getRcnTokenContract());
  }

  public abstract request(params: RequestParams): Promise<string>

  public abstract approveRequest(params: ApproveRequestParams): void

  public abstract lend(params: LendParams): void

  public abstract pay(params: PayParams): void

  public abstract payToken(params: PayParams): void

  public abstract withdraw(params: WithdrawParams): void

  public abstract withdrawPartial(params: WithdrawPartialParams): void

  public abstract getBalance(params: GetBalanceParams): Promise<BigNumber>

  public abstract getAccount(): Promise<string>

  protected async createRequestLoanParam(params: RequestParams): Promise<RequestLoanParams> {
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

    return {
      amount,
      model,
      oracle,
      borrower,
      salt,
      expiration,
      data
    }
  }

  /**
   * Is it Testnet network?
   */
  public isTestnet = async (): Promise<boolean> => {
    return (await this.web3Wrapper.getNetworkIdAsync()) !== 1;
  };

}
