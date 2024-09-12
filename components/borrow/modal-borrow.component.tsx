import React, { useState, useEffect } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import ModalComponent from '@/components/common/modal.component';
import { InputNumber } from 'antd';
import Image from 'next/image';
import { Button, Tooltip, Select, Checkbox } from 'antd';
import {
  InfoCircleOutlined,
  QuestionCircleOutlined,
  DownOutlined,
  CloseOutlined,
  WalletOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons';
import TransactionSuccessComponent from '@/components/borrow/transaction-success.component';
import { useTranslation } from 'next-i18next';
import { COLLATERAL_TOKEN, DEFAULT_PARAMS, DEFAULT_ADDRESS } from '@/constants/common.constant';
import { TRANSACTION_STATUS, CONTRACT_ADDRESS } from '@/constants/common.constant';
import { toCurrency, toAmountShow, toUnitWithDecimal } from '@/utils/common';
import service from '@/utils/backend/borrow';
import service_ccfl_borrow from '@/utils/contract/ccflBorrow.service';
import { useAccount, useDisconnect, useSwitchChain } from 'wagmi';
import { debounce } from 'lodash';

interface ModalBorrowProps {
  isModalOpen: boolean;
  handleCancel: any;
  stableCoin: any;
  step: any;
  setStep: any;
  token: any;
  setToken: any;
  apr: any;
  decimalStableCoin: any;
}

interface IFormInput {
  numberfield: number;
  collateralField: number;
}

export default function ModalBorrowComponent({
  isModalOpen,
  handleCancel,
  stableCoin,
  step,
  setStep,
  token,
  setToken,
  apr,
  decimalStableCoin,
}: ModalBorrowProps) {
  const { control, handleSubmit, setValue } = useForm({
    defaultValues: {
      numberfield: 0,
      collateralField: 0,
    },
  });
  const { t } = useTranslation('common');
  const { address, connector, chainId } = useAccount();

  const [loading, setLoading] = useState<boolean>(false);
  const [isYield, setYield] = useState(false);
  const [loadingBalanceCollateral, setLoadingBalanceCollateral] = useState<boolean>(false);
  const [loadingMinimumCollateral, setLoadingMinimumCollateral] = useState<boolean>(false);
  const [collateralData, setCollateralData] = useState({
    balance: 0,
    balance_usd: 0,
    decimals: 8,
  }) as any;
  const [minimalCollateral, setMinimalCollateral] = useState(0);
  const [stableCoinValue, setStableCoinValue] = useState();
  const [collateralValue, setCollateralValue] = useState();
  const [txHash, setTxHash] = useState();
  const [errorTx, setErrorTx] = useState();
  const [gasFee, setGasFee] = useState(0);
  const [status, setStatus] = useState(TRANSACTION_STATUS.SUCCESS);
  const [healthFactor, setHealthFactor] = useState();

  const onSubmit: SubmitHandler<IFormInput> = async data => {
    const provider = await connector?.getProvider();
    let stableCoinKey: keyof typeof DEFAULT_ADDRESS = stableCoin.toUpperCase();
    let collateralKey: keyof typeof DEFAULT_ADDRESS = token.toUpperCase();
    console.log('stableCoinKey', stableCoinKey, 'collateralKey', collateralKey);

    if (step === 0) {
      try {
        setLoading(true);
        let hash = await service_ccfl_borrow.approveBorrow(
          provider,
          CONTRACT_ADDRESS,
          toUnitWithDecimal(collateralValue ? collateralValue : 0, collateralData.decimals),
          address,
          DEFAULT_ADDRESS[collateralKey],
        );
        console.log('Finnised Approve', hash);
        if (hash) {
          setLoading(false);
          setStep(1);
        }
      } catch (error) {
        setStatus(TRANSACTION_STATUS.FAILED);
        setLoading(false);
        console.log('error', error);
        setErrorTx(error as any);
      }
    }
    if (step == 1) {
      try {
        setLoading(true);
        let IsFiat = false;
        let hash = await service_ccfl_borrow.createLoan(
          toUnitWithDecimal(stableCoinValue ? stableCoinValue : 0, decimalStableCoin),
          toUnitWithDecimal(collateralValue ? collateralValue : 0, collateralData.decimals),
          DEFAULT_ADDRESS[stableCoinKey],
          DEFAULT_ADDRESS[collateralKey],
          isYield,
          IsFiat,
          provider,
          address,
          CONTRACT_ADDRESS,
        );

        if (hash) {
          setStep(2);
          setLoading(false);
          setTxHash(hash);
        }
      } catch (error) {
        setStatus(TRANSACTION_STATUS.FAILED);
        setLoading(false);
        console.log('error', error);
        setErrorTx(error as any);
      }
    }
  };

  const handleChange = (value: any) => {
    setToken(value);
  };

  const handleYield = (e: any) => {
    setYield(e.target.checked);
  };

  const renderTitle = () => {
    if (step === 2) {
      if (status === TRANSACTION_STATUS.FAILED) {
        return `${t('BORROW_MODAL_FAILED')}`;
      }
      return `${t('BORROW_MODAL_BORROW_ALL_DONE')}`;
    }
    return `${t('BORROW_MODAL_BORROW_BORROW')} ${stableCoin?.toUpperCase()}`;
  };

  const handleCollateralBalance = async () => {
    try {
      setLoadingBalanceCollateral(true);
      let res_balance = (await service.getCollateralBalance(
        DEFAULT_PARAMS.address,
        chainId,
        token,
      )) as any;
      let res_price = (await service.getPrice(chainId, token)) as any;
      console.log('handleCollateralBalance', res_balance, res_price);
      if (res_balance) {
        setCollateralData({
          balance: res_balance.balance
            ? toAmountShow(res_balance.balance, res_balance.decimals)
            : 0,
          balance_usd:
            res_price?.price && res_balance.balance
              ? toAmountShow(res_balance.balance * res_price?.price, res_balance.decimals)
              : 0,
          decimals: res_balance.decimals ? res_balance.decimals : 8,
        });
      }
      setLoadingBalanceCollateral(false);
    } catch (error) {
      console.log('error', error);
      setLoadingBalanceCollateral(false);
    }
  };

  const handleGetMinimumCollateral = async () => {
    try {
      setLoadingMinimumCollateral(true);
      let res_collateral = (await service.getCollateralInfo(token, chainId)) as any;

      let tokenDraft: keyof typeof DEFAULT_ADDRESS = stableCoin.toUpperCase();
      let collateralTokenDraft: keyof typeof DEFAULT_ADDRESS = token.toUpperCase();

      let addressStableCoin = DEFAULT_ADDRESS[tokenDraft];
      let addressCollateral = DEFAULT_ADDRESS[collateralTokenDraft];

      const provider = await connector?.getProvider();
      let res = (await service_ccfl_borrow.getCollateralInfo(
        provider,
        CONTRACT_ADDRESS,
        toUnitWithDecimal(stableCoinValue ? stableCoinValue : 0, decimalStableCoin),
        addressStableCoin,
        addressCollateral,
        toUnitWithDecimal(collateralValue ? collateralValue : 0, collateralData.decimals),
      )) as any;
      console.log(
        'handleGetMinimumCollateral',
        tokenDraft,
        collateralTokenDraft,
        res,
        res_collateral,
      );
      if (res && res.minimalCollateral && res_collateral && res_collateral[0]?.decimals) {
        let minimum = toAmountShow(res.minimalCollateral, res_collateral[0].decimals) as any;
        setMinimalCollateral(minimum);
      } else {
        setMinimalCollateral(0);
      }

      setLoadingMinimumCollateral(false);
    } catch (error) {
      console.log('error', error);
      setLoadingMinimumCollateral(false);
    }
  };

  const handleGetFeeApprove = async () => {
    const provider = await connector?.getProvider();
    let collateralKey: keyof typeof DEFAULT_ADDRESS = token.toUpperCase();
    try {
      let res = (await service_ccfl_borrow.getGasFeeApprove(
        provider,
        address,
        toUnitWithDecimal(collateralValue ? collateralValue : 0, collateralData.decimals),
        DEFAULT_ADDRESS[collateralKey],
        CONTRACT_ADDRESS,
      )) as any;
      let res_price = (await service.getPrice(chainId, 'ETH')) as any;
      if (res && res_price && res_price.price) {
        let gasFee = res * res_price.price;
        setGasFee(gasFee);
        console.log('handleGetFee', res, gasFee);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleGetFeeCreateLoan = async () => {
    const provider = await connector?.getProvider();
    let stableCoinKey: keyof typeof DEFAULT_ADDRESS = stableCoin.toUpperCase();
    let collateralKey: keyof typeof DEFAULT_ADDRESS = token.toUpperCase();
    try {
      let res = (await service_ccfl_borrow.getGasFeeCreateLoan(
        provider,
        address,
        CONTRACT_ADDRESS,
        toUnitWithDecimal(stableCoinValue ? stableCoinValue : 0, decimalStableCoin),
        DEFAULT_ADDRESS[stableCoinKey],
        toUnitWithDecimal(collateralValue ? collateralValue : 0, collateralData.decimals),
        DEFAULT_ADDRESS[collateralKey],
        isYield,
        false,
      )) as any;
      let res_price = (await service.getPrice(chainId, 'ETH')) as any;
      if (res && res_price && res_price.price) {
        let gasFee = res * res_price.price;
        setGasFee(gasFee);
        console.log('handleGetFee', res, gasFee);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const handleCheckAllowance = async () => {
    const provider = await connector?.getProvider();
    let collateralKey: keyof typeof DEFAULT_ADDRESS = token.toUpperCase();
    try {
      let res = (await service_ccfl_borrow.checkAllowance(
        provider,
        DEFAULT_ADDRESS[collateralKey],
        address,
        CONTRACT_ADDRESS,
      )) as any;
      if (collateralValue && res > collateralValue) {
        setStep(1);
      } else {
        setStep(0);
      }
    } catch (error) {
      console.log('error', error);
    }
  };

  const resetState = () => {
    setLoading(false);
    setLoadingBalanceCollateral(false);
    setLoadingMinimumCollateral(false);
    setStableCoinValue(undefined);
    setCollateralValue(undefined);
  };

  useEffect(() => {
    if (isModalOpen) {
      handleCollateralBalance();
    }
  }, [token]);

  useEffect(() => {
    if (isModalOpen) {
      handleGetMinimumCollateral();
    }
  }, [stableCoinValue, token, collateralValue]);

  useEffect(() => {
    if (
      isModalOpen &&
      collateralValue &&
      collateralValue > 0 &&
      collateralData.balance > 0 &&
      step === 0
    ) {
      setTimeout(() => {
        handleGetFeeApprove();
      }, 500);
    }
  }, [collateralValue, token]);

  useEffect(() => {
    if (
      isModalOpen &&
      collateralValue &&
      collateralValue > 0 &&
      collateralData.balance > 0 &&
      stableCoinValue &&
      stableCoinValue > 0 &&
      step === 1
    ) {
      setTimeout(() => {
        handleGetFeeCreateLoan();
      }, 500);
    }
  }, [collateralValue, token, stableCoinValue, isYield, step]);

  useEffect(() => {
    if (isModalOpen && collateralValue && collateralValue > 0) {
      // handleCheckAllowance();
    }
  }, [isModalOpen, collateralValue, token]);

  useEffect(() => {
    if (isModalOpen) {
      handleCollateralBalance();
      resetState();
    }
  }, [isModalOpen]);

  return (
    <div>
      <ModalComponent
        title={renderTitle()}
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        closeIcon={step === 2 ? false : <CloseOutlined />}>
        {step !== 2 && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="modal-borrow-content">
              <div className="px-6 py-4 ">
                <div className="modal-borrow-title mb-2 ">
                  {t('BORROW_MODAL_BORROW_BORROW_AMOUNT')}
                </div>
                <div className={`modal-borrow-amount ${loading ? 'loading' : ''}`}>
                  <div className="flex items-center">
                    <Controller
                      name="numberfield"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          placeholder={t('BORROW_MODAL_BORROW_ENTER_AMOUNT')}
                          className="flex-1"
                          controls={false}
                          value={stableCoinValue}
                          onChange={(value: any) => {
                            setStableCoinValue(value);
                          }}
                        />
                      )}
                    />
                    <div className="flex">
                      <Image
                        src={`/images/common/${stableCoin}.png`}
                        alt={stableCoin}
                        width={24}
                        height={24}
                      />
                      <span className="modal-borrow-token ml-2">{stableCoin?.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="modal-borrow-usd">≈ $0.00</span>
                    {/* <Button disabled={loading} className="modal-borrow-max">
                      {t('BORROW_MODAL_BORROW_MAX')}
                    </Button> */}
                  </div>
                </div>
              </div>
              <div className="modal-borrow-overview">
                <div className="modal-borrow-sub-title">
                  {t('BORROW_MODAL_BORROW_LOAN_OVERVIEW')}
                </div>
                <div className="flex justify-between items-center">
                  <span className="modal-borrow-sub-content">
                    {t('BORROW_MODAL_BORROW_VARIABLE_APR')}
                    <sup>
                      <Tooltip placement="top" title={'a'} className="ml-1">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </sup>
                  </span>
                  <div className="modal-borrow-percent">
                    <span>{toCurrency(apr, 2)}</span>
                    <span>%</span>
                  </div>
                </div>
              </div>
              <div className="modal-borrow-collateral">
                <div className="modal-borrow-sub-title">
                  {t('BORROW_MODAL_BORROW_COLLATERAL_SETUP')}
                </div>
                <div className="flex justify-between items-center  mb-2">
                  <span className="modal-borrow-sub-content">
                    {t('BORROW_MODAL_BORROW_COLLATERAL_TOKEN')}
                    <sup>
                      <Tooltip placement="top" title={'a'} className="ml-1">
                        <InfoCircleOutlined />
                      </Tooltip>
                    </sup>
                  </span>
                  <Select
                    defaultValue={{
                      value: token,
                      label: token,
                    }}
                    options={COLLATERAL_TOKEN.map((item: any) => ({
                      value: item.name,
                      label: item.name,
                    }))}
                    onChange={handleChange}
                    suffixIcon={<DownOutlined />}
                    popupClassName="modal-borrow-select"
                    value={token}
                  />
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="modal-borrow-sub-content">
                    <WalletOutlined className="wallet-icon" /> {token} {t('BORROW_MODAL_BALANCE')}
                  </div>
                  <div className="modal-borrow-value">
                    <span>{collateralData.balance}</span>
                    <span className="ml-1 token">{token}</span>
                    <div className="modal-borrow-value-usd">${collateralData.balance_usd}</div>
                  </div>
                </div>
                <div className="flex justify-between items-start">
                  <div className="modal-borrow-sub-content">
                    {t('BORROW_MODAL_BORROW_COLLATERAL')}
                  </div>
                  <div className="flex items-center modal-borrow-collateral-amount">
                    <Controller
                      name="collateralField"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          placeholder={t('BORROW_MODAL_BORROW_ENTER_AMOUNT')}
                          className="flex-1 "
                          controls={false}
                          value={collateralValue}
                          onChange={(value: any) => {
                            setCollateralValue(value);
                          }}
                        />
                      )}
                    />
                    <span className="">{token?.toUpperCase()}</span>
                  </div>
                </div>
                <div className="modal-borrow-minimum">
                  <span className="mr-1">Minimum amount: </span> {minimalCollateral} {token}
                </div>
                <div className="flex justify-between items-center modal-borrow-health c-white">
                  <div className="modal-borrow-sub-content">{t('BORROW_MODAL_BORROW_HEALTH')}</div>
                  <div className="flex">
                    <span className="c-white">3.31B</span>
                    {collateralValue && collateralValue > 0 && (
                      <div className="flex">
                        <ArrowRightOutlined className="mx-1" />
                        <span className="">3.33B</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-borrow-gas">
                <div className="modal-borrow-sub-content">
                  {t('BORROW_MODAL_BORROW_GAS')}
                  <sup>
                    <Tooltip placement="top" title={'a'} className="ml-1">
                      <InfoCircleOutlined />
                    </Tooltip>
                  </sup>
                </div>
                <div className="modal-borrow-gas-value">
                  <span>$</span>
                  <span className="ml-1">{gasFee}</span>
                </div>
              </div>
              <div className="modal-borrow-footer">
                {step === 0 && (
                  <div className="approve-inner">
                    <div className="modal-borrow-question">
                      <Tooltip placement="top" title={'a'}>
                        <QuestionCircleOutlined />
                      </Tooltip>
                      {t('BORROW_MODAL_BORROW_WHY')}
                    </div>
                    <Button
                      htmlType="submit"
                      type="primary"
                      disabled={
                        !stableCoinValue ||
                        !collateralValue ||
                        collateralValue < minimalCollateral ||
                        loadingBalanceCollateral ||
                        loadingMinimumCollateral ||
                        collateralData.balance === 0
                      }
                      className="w-full"
                      loading={loading}>
                      {t('BORROW_MODAL_BORROW_APPROVE', { stableCoin: token })}
                    </Button>
                  </div>
                )}
                {step === 1 && (
                  <div>
                    <div className="modal-borrow-yield">
                      <Checkbox onChange={handleYield}>{t('BORROW_MODAL_BORROW_YIELD')}</Checkbox>
                    </div>
                    <div className="px-6 py-4">
                      <Button
                        htmlType="submit"
                        type="primary"
                        disabled={
                          !stableCoinValue ||
                          !collateralValue ||
                          collateralValue < minimalCollateral ||
                          loadingBalanceCollateral ||
                          loadingMinimumCollateral ||
                          collateralData.balance === 0
                        }
                        className="w-full"
                        loading={loading}>
                        {t('BORROW_MODAL_BORROW_DEPOSIT', { token: token })}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        )}
        {step === 2 && (
          <div>
            <TransactionSuccessComponent
              handleCancel={handleCancel}
              stableCoin={stableCoin}
              setStep={setStep}
              token={token}
              isBorrow={true}
              status={status}
              stableCoinAmount={stableCoinValue}
              collateralAmount={collateralValue}
              hash={txHash}
              errorTx={errorTx}
            />
          </div>
        )}
      </ModalComponent>
    </div>
  );
}
