import cssClass from '@/pages/borrow/index.module.scss';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
// import SelectComponent from '@/components/common/select.component';
import AssetComponent from '@/components/borrow/asset.component';
import LoansComponent from '@/components/borrow/loans.component';
import ModalBorrowComponent from '@/components/borrow/modal-borrow.component';
import ModalRepayComponent from '@/components/borrow/modal-repay.component';
import OverviewComponent from '@/components/common/overview.component';
import TitleComponent from '@/components/common/title.component';
import { CHAIN_INFO, SUPPORTED_CHAINS } from '@/constants/chains.constant';
import { COLLATERAL_TOKEN, TYPE_COMMON } from '@/constants/common.constant';
import { NETWORKS, STAKE_DEFAULT_NETWORK } from '@/constants/networks';
import { useNotification } from '@/hooks/notifications.hook';
import { CaretDownOutlined } from '@ant-design/icons';
import type { SelectProps } from 'antd';
import { Select } from 'antd';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import { useAccount, useSwitchChain } from 'wagmi';

import ModalBorrowFiatSuccessComponent from '@/components/borrow/modal-borrow-fiat/modal-borrow-fiat-success.component';
import ModalBorrowFiatComponent from '@/components/borrow/modal-borrow-fiat/modal-borrow-fiat.component';
import ModalCollateralComponent from '@/components/borrow/modal-collateral.component';
import ModalWithdrawCollateralComponent from '@/components/borrow/modal-withdraw-collateral.component';

type LabelRender = SelectProps['labelRender'];
enum BorrowModalType {
  Crypto = 'crypto',
  Fiat = 'FIAT',
  FiatSuccess = 'fiat-success',
}

export default function BorrowPage() {
  const { t } = useTranslation('common');
  const { switchChain } = useSwitchChain();
  const [modal, setModal] = useState({} as any);
  const [isModalRepayOpen, setIsModalRepayOpen] = useState(false);
  const [isModalCollateralOpen, setIsModalCollateralOpen] = useState(false);
  const [isModalWithdrawCollateral, setIsModalWithdrawCollateral] = useState(false);

  const [currentToken, setCurrentToken] = useState('');

  const [collateralToken, setCollateralToken] = useState(COLLATERAL_TOKEN[0].name);
  const [step, setStep] = useState(0);
  const [token, setToken] = useState(COLLATERAL_TOKEN[0].name);
  const { address, isConnected, chainId } = useAccount();
  const [isFiat, setIsFiat] = useState(false);

  //connect wallet
  const [showSuccess, showError, showWarning, contextHolder] = useNotification();
  const [networkInfo, setNetworkInfo] = useState<any | null>(null);

  const showModal = (token: string) => {
    setModal({
      type: token == BorrowModalType.Fiat ? BorrowModalType.Fiat : BorrowModalType.Crypto,
      token,
    });
  };
  const showWithdrawCollateralModal = (token: string) => {
    setCollateralToken(token);
    setIsModalWithdrawCollateral(true);
  };
  const showRepayModal = (token: string, repaymentCurrency: string) => {
    if (repaymentCurrency) {
      setIsFiat(true);
      setCurrentToken(repaymentCurrency);
    } else {
      setIsFiat(false);
      setCurrentToken(token);
    }
    setIsModalRepayOpen(true);
  };
  const showCollateralModal = (token: string) => {
    setCollateralToken(token);
    setIsModalCollateralOpen(true);
  };

  const handleCancel = () => {
    setModal({
      type: '',
    });
    setStep(0);
    setToken(COLLATERAL_TOKEN[0].name);
  };
  const handleRepayCancel = () => {
    setCurrentToken('');
    setIsModalRepayOpen(false);
    setStep(0);
  };
  const handleCollateralCancel = () => {
    setCollateralToken('');
    setIsModalCollateralOpen(false);
    setStep(0);
  };
  const handleWithdrawCollateralCancel = () => {
    setCollateralToken('');
    setIsModalWithdrawCollateral(false);
    setStep(0);
  };

  const itemLeft = [
    {
      text: t('BORROW_OVERVIEW_BALANCE'),
      content: ' 1,875.00',
      type: TYPE_COMMON.USD,
    },
    {
      text: t('BORROW_OVERVIEW_COLLATERAL'),
      content: ' 1,875.00',
      type: TYPE_COMMON.USD,
    },
  ];

  const itemRight = [
    {
      text: t('BORROW_APY'),
      content: '0.07',
      type: TYPE_COMMON.PERCENT,
    },
    {
      text: t('BORROW_OVERVIEW_FINANCE_HEALTH'),
      content: '1.66',
      type: TYPE_COMMON.FINANCE_HEALTH,
    },
  ];
  const labelRender: LabelRender = (props: any) => {
    let { name, logo } = props;

    // TODO: please remove before release it to PRD
    if (!name) {
      name = 'Avalanche';
      logo = '/images/tokens/avax.png';
    }

    return (
      <div className="flex items-center">
        <Image
          src={logo}
          alt={name}
          width={24}
          height={24}
          style={{
            height: 24,
            width: 24,
          }}
          className="mr-2"
        />
        {name}
      </div>
    );
  };
  const selectedChain = CHAIN_INFO.get(chainId) || {};

  //connect wallet
  const switchNetwork = async () => {
    try {
      const rs = await switchChain({ chainId: STAKE_DEFAULT_NETWORK?.chain_id_decimals });
    } catch (error) {
      console.log('🚀 ~ switchNetwork ~ error:', error);
      showError(error);
    }
  };

  const initNetworkInfo = useCallback(() => {
    if (chainId) {
      const networkCurrent = NETWORKS.find(item => item.chain_id_decimals === chainId);
      setNetworkInfo(networkCurrent || null);
    }
  }, [chainId]);

  useEffect(() => {
    if (address) {
      // getBalance();
      initNetworkInfo();
    }
  }, [address, initNetworkInfo]);

  const handleBorrowFiatOk = ({ paymentMethod }: any) => {
    setModal({
      type: BorrowModalType.FiatSuccess,
      paymentMethod,
    });
  };
  return (
    <div className={twMerge('borrow-page-container', cssClass.borrowPage)}>
      <div className="borrow-header">
        <TitleComponent text={t('BORROW_OVERVIEW_TITLE')}>
          <div className="select-wrapper ml-6">
            <Select
              labelRender={labelRender}
              defaultValue={{
                value: selectedChain?.id,
                label: selectedChain?.name,
                logo: selectedChain?.logo,
              }}
              options={SUPPORTED_CHAINS.map((item: any) => ({
                value: item.id,
                name: item.name,
                label: (
                  <div className="chain-dropdown-item-wrapper">
                    <Image
                      src={item.logo}
                      alt={item.name}
                      width={12}
                      height={12}
                      style={{
                        height: 12,
                        width: 12,
                      }}
                      className="mr-2"
                    />
                    {item.name}
                  </div>
                ),
                logo: item?.logo,
              }))}
              suffixIcon={<CaretDownOutlined />}
            />
          </div>
        </TitleComponent>
      </div>
      {isConnected && networkInfo && (
        <div className="mb-4">
          <OverviewComponent itemLeft={itemLeft} itemRight={itemRight} />
        </div>
      )}
      <div className="flex gap-4 borrow-inner">
        {isConnected && networkInfo && (
          <div className="xl:basis-1/2 basis-full">
            <LoansComponent
              showModal={showModal}
              showRepayModal={showRepayModal}
              showCollateralModal={showCollateralModal}
              showWithdrawCollateralModal={showWithdrawCollateralModal}
            />
          </div>
        )}
        <div
          className={`${isConnected && networkInfo ? 'xl:basis-1/2' : 'xl:basis-full'} basis-full`}>
          <AssetComponent
            showModal={showModal}
            isConnected={isConnected}
            switchNetwork={switchNetwork}
            networkInfo={networkInfo}
          />
        </div>
      </div>
      <ModalBorrowComponent
        isModalOpen={BorrowModalType.Crypto == modal.type}
        handleCancel={handleCancel}
        currentToken={modal.token}
        step={step}
        setStep={setStep}
        token={token}
        setToken={setToken}
      />
      <ModalRepayComponent
        isModalOpen={isModalRepayOpen}
        handleCancel={handleRepayCancel}
        currentToken={currentToken}
        step={step}
        setStep={setStep}
        isFiat={isFiat}
      />
      <ModalCollateralComponent
        isModalOpen={isModalCollateralOpen}
        handleCancel={handleCollateralCancel}
        currentToken={collateralToken}
        step={step}
        setStep={setStep}
      />
      <ModalWithdrawCollateralComponent
        isModalOpen={isModalWithdrawCollateral}
        handleCancel={handleWithdrawCollateralCancel}
        currentToken={collateralToken}
        step={step}
        setStep={setStep}
      />
      <ModalBorrowFiatComponent
        isModalOpen={BorrowModalType.Fiat == modal.type}
        handleCancel={handleCancel}
        handleOk={handleBorrowFiatOk}
        currentToken={modal.token}
        step={step}
        setStep={setStep}
        token={token}
        setToken={setToken}
      />

      <ModalBorrowFiatSuccessComponent
        isModalOpen={BorrowModalType.FiatSuccess == modal.type}
        paymentMethod={modal.paymentMethod}
        handleCancel={handleCancel}
      />
    </div>
  );
}
export const getStaticProps = async ({ locale }: any) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
});
