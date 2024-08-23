/* eslint-disable react-hooks/rules-of-hooks */
import cssClass from '@/components/borrow/asset.component.module.scss';
import SafeHtmlComponent from '@/components/common/safe-html.component';
import { ASSET_LIST } from '@/constants/common.constant';
import { STAKE_DEFAULT_NETWORK } from '@/constants/networks';
import eventBus from '@/hooks/eventBus.hook';
import service from '@/utils/backend/borrow';
import { toCurrency } from '@/utils/common';
import { Button, Skeleton } from 'antd';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

interface AssetProps {
  showModal: any;
  isConnected: any;
  switchNetwork: any;
  networkInfo: any;
}

export default function assetComponent({
  showModal,
  isConnected,
  switchNetwork,
  networkInfo,
}: AssetProps) {
  const { t } = useTranslation('common');
  const [tokenList, setTokenList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePrice = async () => {
    try {
      setLoading(true);
      let data = (await service.getPool('11155111')) as any;
      if (data && data[0]) {
        let priceUSDC = (await service.getPrice(
          1,
          data[0].asset ? data[0].asset : ASSET_LIST.USDC,
        )) as any;
        if (priceUSDC && priceUSDC[0]) {
          data[0].usd = data[0].loan_available * priceUSDC[0].price;
        }
      }
      if (data && data[1]) {
        let priceUSDT = (await service.getPrice(
          1,
          data[1].asset ? data[1].asset : ASSET_LIST.USDT,
        )) as any;
        if (priceUSDT && priceUSDT[0]) {
          data[1].usd = data[1].loan_available * priceUSDT[0].price;
        }
      }

      setTokenList(data);
    } catch (error) {
      console.log('error', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handlePrice();
  }, []);

  return (
    <div className={twMerge(cssClass.assetComponent)}>
      <div className="asset-container">
        <div className="asset-header">{t('BORROW_MODAL_BORROW_ASSET_TO_BORROW')}</div>
        <div className="">
          <div className="xl:gap-6 asset-nav gap-1">
            <div
              className={`${
                isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-1/6'
              } basis-1/4`}>
              {t('BORROW_MODAL_BORROW_ADJUST_ASSET')}
            </div>
            <div
              className={`${
                isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-1/6'
              } basis-1/4`}>
              {t('BORROW_MODAL_BORROW_BORROW_LOAN_AVAILABLE')}
            </div>
            <div
              className={`${
                isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-1/6'
              } basis-1/4`}>
              {t('BORROW_MODAL_BORROW_ADJUST_APR_VARIABLE')}
            </div>
            <div
              className={`${
                isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-3/6'
              } basis-1/4`}></div>
          </div>
          {loading ? (
            <div className="asset-empty">
              <Skeleton active />
            </div>
          ) : (
            <>
              {tokenList && tokenList.length > 0 ? (
                <>
                  {tokenList?.map((item: any, index: any) => (
                    <div className="xl:gap-6 asset-body gap-1" key={index}>
                      <div
                        className={`${
                          isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-1/6'
                        } basis-1/4`}>
                        <Image
                          className="mr-2"
                          src={`/images/common/${item.asset}.png`}
                          alt={item.asset}
                          width={40}
                          height={40}
                        />
                        {item.asset?.toUpperCase()}
                      </div>
                      <div
                        className={`${
                          isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-1/6'
                        } flex-col items-start justify-center	basis-1/4`}>
                        <div>{toCurrency(item.loan_available, 2)}</div>
                        <div className="usd">$ {toCurrency(item.usd, 2)}</div>
                      </div>
                      <div
                        className={`${
                          isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-1/6'
                        } basis-1/4`}>
                        {toCurrency(item.apr, 2)}%
                      </div>
                      <div
                        className={`${
                          isConnected && networkInfo ? 'xl:basis-1/4' : 'xl:basis-3/6'
                        } justify-end basis-1/4`}>
                        {isConnected && networkInfo ? (
                          <Button onClick={() => showModal(item.asset)}>
                            {t('BORROW_MODAL_BORROW_BORROW')}
                          </Button>
                        ) : (
                          <React.Fragment>
                            {isConnected ? (
                              <Button onClick={() => switchNetwork()} className={'guest'}>
                                <SafeHtmlComponent
                                  htmlContent={t('BORROW_CONNECT_WALLET_SWITCH', {
                                    networkName: STAKE_DEFAULT_NETWORK?.name,
                                  })}
                                />
                              </Button>
                            ) : (
                              <Button
                                onClick={() => eventBus.emit('handleWalletConnect')}
                                className={'guest'}>
                                <SafeHtmlComponent htmlContent={t('BORROW_CONNECT_WALLET')} />
                              </Button>
                            )}
                          </React.Fragment>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="asset-empty">{t('BORROW_MODAL_ASSET_NO_DATA')}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
