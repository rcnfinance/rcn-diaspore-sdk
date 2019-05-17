import { TxData, Provider } from 'ethereum-types';
import {
  LoanManagerContract,
  DebtEngineContract,
  InstallmentsModelContract,
  RegistryContract,
  OracleContract,
  IERC20Contract
} from '@jpgonzalezra/abi-wrappers';
import {
  IERC20,
  LoanManager,
  DebtEngine,
  Registry,
  Oracle,
  InstallmentsModel
} from '@jpgonzalezra/diaspore-contract-artifacts';
import { Web3Wrapper } from '@0x/web3-wrapper';
import { DiasporeContracts, NetworkId } from '../types';
import assert from '../utils/assert';
import getDefaultContractAddresses from '../utils/addresses';

async function getRcnRegistryContract(web3Wrapper: Web3Wrapper, address?: string) {
  return new RegistryContract(
    Registry.abi,
    address || (await getDefaultContractAddresses((await web3Wrapper.getNetworkIdAsync()) as NetworkId)), // for optional address
    web3Wrapper.getProvider(),
    web3Wrapper.getContractDefaults(),
  );
}

export default class ContractFactory {
  private web3Wrapper: Web3Wrapper;

  private provider: Provider;
  private rcnRegistry: Promise<RegistryContract>;
  private contractDefaults: Partial<TxData>;

  public constructor(web3Wrapper: Web3Wrapper, rcnRegistryAddress: string) {
    this.web3Wrapper = web3Wrapper;
    this.provider = web3Wrapper.getProvider() as Provider;
    this.contractDefaults = this.web3Wrapper.getContractDefaults();
    this.rcnRegistry = getRcnRegistryContract(web3Wrapper, rcnRegistryAddress);;
  }

  public async getRcnTokenContract(): Promise<IERC20Contract> {
    return new IERC20Contract(
      IERC20.abi,
      await (await this.rcnRegistry).getAddress.callAsync(DiasporeContracts.IERC20Contract),
      this.provider,
      this.contractDefaults,
    );
  }

  public async getLoanManagerContract(address?: string): Promise<LoanManagerContract> {
    if (address == undefined) {
      address = await (await this.rcnRegistry).getAddress.callAsync(DiasporeContracts.LoanManagerContract);
    }
    assert.isETHAddressHex('address', address);
    return new LoanManagerContract(
      LoanManager.abi, 
      address,
      this.provider,
      this.contractDefaults,
    );
  }

  public async getDebtEngineContract(address?: string): Promise<DebtEngineContract> {
    if (address == undefined) {
      address = await (await this.rcnRegistry).getAddress.callAsync(DiasporeContracts.DebtEngineContract);
    }
    assert.isETHAddressHex('address', address);
    return new DebtEngineContract(
      DebtEngine.abi,
      address,
      this.provider,
      this.contractDefaults,
    );
  }

  public async getInstallmentsModelContract(address?: string): Promise<InstallmentsModelContract> {
    if (address == undefined) {
      address = await (await this.rcnRegistry).getAddress.callAsync(DiasporeContracts.InstallmentsModelContract);
    }
    assert.isETHAddressHex('address', address);
    return new InstallmentsModelContract(
      InstallmentsModel.abi,
      address,
      this.provider,
      this.contractDefaults,
    );
  }

  public async getOracleContract(address?: string): Promise<OracleContract> {
    if (address == undefined) {
      address = await (await this.rcnRegistry).getAddress.callAsync(DiasporeContracts.OracleContract);
    }
    assert.isETHAddressHex('address', address);
    return new OracleContract(
      Oracle.abi,
      address,
      this.provider,
      this.contractDefaults,
    );
  }
  
}
