import { Web3Wrapper } from '@0x/web3-wrapper';
import ERC20TokenWrapper from '../contract_wrappers/tokens/erc20_wrapper';
import ContractFactory from './contract_factory';
import assert from '../utils/assert';
import RcnTokenWrapper from './../contract_wrappers/tokens/rcn_token_wrapper'

/**
 * The TokenWrapperFactory class is a factory to generate new RcnTokenWrappers.
 */
export default class TokenWrapperFactory {
  private readonly web3Wrapper: Web3Wrapper;

  /**
   * An instance of the ContractFactory class containing methods
   * to create instances for each contract.
   */
  private contractFactory: ContractFactory;

  public constructor(
    web3Wrapper: Web3Wrapper,
    contractFactory: ContractFactory,
  ) {
    this.web3Wrapper = web3Wrapper;
    this.contractFactory = contractFactory;
  }

  /**
   * @param address Security Token contract address
   *
   * @memberof SecurityTokenWrapperFactory
   */
  public getRcnTokenInstanceFromAddress = async (): Promise<ERC20TokenWrapper> => {
    const token = new RcnTokenWrapper(
      this.web3Wrapper,
      this.contractFactory.getRcnTokenContract(),
    );
    if (await token.isValidContract()) {
      return token;
    }
    // TODO: Replace this for a typed Error
    throw new Error();
  };

}
