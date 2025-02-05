import { Inject } from '@nestjs/common';
import { BigNumberish } from 'ethers';

import { IAppToolkit, APP_TOOLKIT } from '~app-toolkit/app-toolkit.interface';
import { PositionTemplate } from '~app-toolkit/decorators/position-template.decorator';
import {
  GetMasterChefDataPropsParams,
  GetMasterChefTokenBalancesParams,
  MasterChefTemplateContractPositionFetcher,
} from '~position/template/master-chef.template.contract-position-fetcher';

import { JpegdContractFactory, JpegdLpFarmV2 } from '../contracts';

@PositionTemplate()
export class EthereumJpegdChefV2ContractPositionFetcher extends MasterChefTemplateContractPositionFetcher<JpegdLpFarmV2> {
  groupLabel = 'Staking';
  chefAddress = '0xb271d2c9e693dde033d97f8a3c9911781329e4ca';

  constructor(
    @Inject(APP_TOOLKIT) protected readonly appToolkit: IAppToolkit,
    @Inject(JpegdContractFactory) protected readonly contractFactory: JpegdContractFactory,
  ) {
    super(appToolkit);
  }

  getContract(address: string): JpegdLpFarmV2 {
    return this.contractFactory.jpegdLpFarmV2({ address, network: this.network });
  }

  async getPoolLength(contract: JpegdLpFarmV2): Promise<BigNumberish> {
    return contract.poolLength();
  }

  async getStakedTokenAddress(contract: JpegdLpFarmV2, poolIndex: number): Promise<string> {
    return contract.poolInfo(poolIndex).then(v => v.lpToken);
  }

  async getRewardTokenAddress(contract: JpegdLpFarmV2): Promise<string> {
    return contract.jpeg();
  }

  async getTotalAllocPoints({ contract }: GetMasterChefDataPropsParams<JpegdLpFarmV2>): Promise<BigNumberish> {
    return contract.totalAllocPoint();
  }

  async getTotalRewardRate({ contract }: GetMasterChefDataPropsParams<JpegdLpFarmV2>): Promise<BigNumberish> {
    return contract.epoch().then(v => v.rewardPerBlock);
  }

  async getPoolAllocPoints({
    contract,
    definition,
  }: GetMasterChefDataPropsParams<JpegdLpFarmV2>): Promise<BigNumberish> {
    return contract.poolInfo(definition.poolIndex).then(v => v.allocPoint);
  }

  async getStakedTokenBalance({
    address,
    contract,
    contractPosition,
  }: GetMasterChefTokenBalancesParams<JpegdLpFarmV2>): Promise<BigNumberish> {
    return contract.userInfo(contractPosition.dataProps.poolIndex, address).then(v => v.amount);
  }

  async getRewardTokenBalance({
    address,
    contract,
    contractPosition,
  }: GetMasterChefTokenBalancesParams<JpegdLpFarmV2>): Promise<BigNumberish> {
    return contract.pendingReward(contractPosition.dataProps.poolIndex, address);
  }
}
