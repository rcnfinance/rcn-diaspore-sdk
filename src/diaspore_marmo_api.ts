import {
    RequestParams,
    DiasporeApi,
    LendParams,
    PayParams,
    GetBalanceParams,
    WithdrawParams,
    WithdrawPartialParams,
    ApproveRequestParams
} from './diaspore_api'

export class DiasporeMarmoAPI implements DiasporeApi {

    public request = async (params: RequestParams): Promise<string> => {
        //TODO: implement
    }

    public lend = async (params: LendParams) => {
        //TODO: implement
    }

    public pay = async (params: PayParams) => {
        //TODO: implement
    }

    public payToken = async (params: PayParams) => {
        //TODO: implement
    }

    public withdraw = async (params: WithdrawParams) => {
        //TODO: implement
    }

    public withdrawPartial = async (params: WithdrawPartialParams) => {
        //TODO: implement
    }

    public approveRequest = async (params: ApproveRequestParams) => {
        //TODO: implement
    }

    public getAccount = async (): Promise<string> => {
        //TODO: implement
    }

    public getBalance = async (params: GetBalanceParams): Promise<BigNumber> => {
        //TODO: implement
    }

    public isTestnet = async (): Promise<boolean> => {
        //TODO: implement
    }

}
