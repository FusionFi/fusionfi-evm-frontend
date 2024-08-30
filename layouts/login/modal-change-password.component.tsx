import React, { useState, useEffect, useCallback } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Modal } from 'antd';
import { Button } from 'antd';
import { useTranslation } from 'next-i18next';
import cssClass from './modal-change-password.component.module.scss';
import eventBus from '@/hooks/eventBus.hook';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import validator from 'validator';
import { useAuth } from '@/hooks/auth.hook';
import { twMerge } from 'tailwind-merge';
import { CloseOutlined } from '@ant-design/icons';
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import Image from 'next/image';

interface ModalCollateralProps {}

interface IFormInput {
  oldPassword: string;
  password: string;
  confirmPassword: string;
}

export default function ModalChangePasswordComponent({}: ModalCollateralProps) {
  const { t } = useTranslation('common');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [isVisibleRePassword, setIsVisibleRePassword] = useState(false);
  const [isVisibleOldPassword, setIsVisibleOldPassword] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    register,
    reset,
    getValues,
  } = useForm({
    resolver: yupResolver(
      yup.object({
        oldPassword: yup
          .string()
          .required()
          .notOneOf([yup.ref('password')], ''),
        password: yup.string().required(),
        confirmPassword: yup
          .string()
          .required()
          .oneOf([yup.ref('password')], ''),
      }),
    ),
    defaultValues: {
      oldPassword: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit: SubmitHandler<IFormInput> = data => {
    updateAuth({ password: data.password });
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setIsSuccess(true);
      reset();
      setIsVisibleOldPassword(false);
      setIsVisiblePassword(false);
      setIsVisibleRePassword(false);
    }, 1000);
  };

  const [loading, setLoading] = useState<boolean>(false);

  /**
   * HOOKS
   */
  const [auth, updateAuth] = useAuth();

  /**
   * FUNCTIONS
   */
  const _handleCancel = useCallback(() => {
    setIsSuccess(false);
    setIsModalOpen(false);
  }, []);
  const _handleOk = useCallback(() => {
    setIsSuccess(false);
    setIsModalOpen(false);
  }, []);

  /**
   * USE EFFECTS
   */
  useEffect(() => {
    const openChangePasswordModal = () => {
      setIsModalOpen(true);
    };

    eventBus.on('openChangePasswordModal', openChangePasswordModal);

    // Cleanup listener on component unmount
    return () => {
      eventBus.off('openChangePasswordModal', openChangePasswordModal);
    };
  }, []);

  return (
    <Modal
      wrapClassName={cssClass[`change-password-wrapper`]}
      title={isSuccess ? t('NEW_PASSWORD_SUCCESS') : t('CHANGE_PASSWORD_TITLE')}
      open={isModalOpen}
      onOk={_handleOk}
      onCancel={_handleCancel}
      closeIcon={isSuccess ? false : <CloseOutlined />}
      className={isSuccess ? 'non-close' : ''}
      footer={null}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {!isSuccess ? (
          <div className="signup-inner">
            <div className="signup-body">
              <div className="flex justify-between items-center">
                <span>{t('CHANGE_PASSWORD_OLD')}:</span>
                <div className="input-warpper">
                  <input
                    {...register('oldPassword')}
                    placeholder={t('SIGNUP_PASSWORD_PLACEHOLDER')}
                    type={isVisibleOldPassword ? 'text' : 'password'}
                    name="oldPassword"
                  />
                  <div onClick={() => setIsVisibleOldPassword(!isVisibleOldPassword)}>
                    {isVisibleOldPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('NEW_PASSWORD_CONTENT')}:</span>
                <div className="input-warpper">
                  <input
                    {...register('password')}
                    placeholder={t('SIGNUP_PASSWORD_PLACEHOLDER')}
                    type={isVisiblePassword ? 'text' : 'password'}
                    name="password"
                  />
                  <div onClick={() => setIsVisiblePassword(!isVisiblePassword)}>
                    {isVisiblePassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span>{t('NEW_PASSWORD_CONFIRM')}:</span>
                <div className="input-warpper">
                  <input
                    {...register('confirmPassword')}
                    placeholder={t('NEW_PASSWORD_CONFIRM_PLACEHOLDER')}
                    type={isVisibleRePassword ? 'text' : 'password'}
                    name="confirmPassword"
                  />
                  <div onClick={() => setIsVisibleRePassword(!isVisibleRePassword)}>
                    {isVisibleRePassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </div>
                </div>
              </div>
            </div>
            <div className="signup-footer">
              <Button htmlType="submit" disabled={!isValid} className="w-full" loading={loading}>
                {t('CHANGE_PASSWORD_TITLE')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="modal-success-container">
            <div className="modal-success-container__status">
              <Image
                src="/images/status/success.png"
                alt="Transaction Success"
                width={80}
                height={80}
              />
            </div>
            <div className="modal-success-container__action">
              <Button
                onClick={_handleCancel}
                type="primary"
                className={twMerge('btn-default-custom')}
                block>
                {t('SIGNUP_SUCCESS_MODAL_BTN_OK')}
              </Button>
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
}
