import {
  LoanManager,
  DebtEngine,
  Model,
  Cosigner,
} from '@jpgonzalezra/diaspore-contract-artifacts';
import { Response } from '@jpgonzalezra/abi-wrappers';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { BigNumber, providerUtils } from '@0x/utils';
import { Provider } from 'ethereum-types';
import assert from './utils/assert';
import ContractFactory from './factories/contract_factory';
import LoanManagerWrapper from './contract_wrappers/components/loan_manager_wrapper'

/**
 * @param provider The web3 provider
 * @param loanManagerAddress The loanManagerAddress contract address '0x...'
 */
export interface ApiConstructorParams {
  provider: Provider;
  rcnTokenAddress: string;
  loanManagerAddress: string;
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

/**
 * The DiasporeAPI class contains smart contract wrappers helpful to interact with rcn diaspore ecosystem.
 */
export class DiasporeAPI {
  /**
   * An instance of the LoanManagerWrapper class containing methods
   * for interacting with diaspore smart contract.
   */
  public loanManagerWrapper: LoanManagerWrapper;

  
  private readonly web3Wrapper: Web3Wrapper;
  private contractFactory: ContractFactory;

  /**
   * Instantiates a new DiasporeAPI instance.
   * @return  An instance of the DiasporeAPI class.
   */
  public constructor(params: ApiConstructorParams) {
    providerUtils.standardizeOrThrow(params.provider);
    if (params.rcnTokenAddress !== undefined) {
      assert.isETHAddressHex('rcnTokenAddress', params.rcnTokenAddress);
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

    this.contractFactory = new ContractFactory(this.web3Wrapper, params.rcnTokenAddress);

    this.loanManagerWrapper = new LoanManagerWrapper(
      this.web3Wrapper,
      this.contractFactory.getLoanManagerContract(params.loanManagerAddress),
    );

    /*this.rcnToken = new RCNTokenWrapper(this.web3Wrapper, this.contractFactory.getRcnTokenContract());
    this.tokenFactory = new TokenWrapperFactory(this.web3Wrapper, this.contractFactory);
    this.rcnTokenFaucet = new RcnTokenFaucetWrapper(
      this.web3Wrapper,
      this.contractFactory.getRcnTokenFaucetContract(),
    );*/
  }

  /*public getRcnTokens = async (params: GetTokensParams): Promise<Response> => {
    const networkId = await this.web3Wrapper.getNetworkIdAsync();
    if (networkId === 1) {
      throw new Error('Only for testnet');
    }
    assert.isNumber('amount', params.amount);
    const address = params.address !== undefined ? params.address : await this.getAccount();
    assert.isETHAddressHex('address', address);

    return this.rcnTokenFaucet.getTokens({
      amount: new BigNumber(params.amount),
      recipient: address,
    });
  };*/

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
