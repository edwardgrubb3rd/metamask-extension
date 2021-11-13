import React from 'react';
import PropTypes from 'prop-types';

import { GAS_ESTIMATE } from '../../../../shared/constants/gas';
import { useI18nContext } from '../../../hooks/useI18nContext';
import I18nValue from '../../ui/i18n-value';
import LoadingHeartBeat from '../../ui/loading-heartbeat';
import Popover from '../../ui/popover';
import Typography from '../../ui/typography/typography';

import { COLORS } from '../../../helpers/constants/design-system';
import EditGasItem from './edit-gas-item';
import NetworkStatus from './network-status';

const EditGasFeePopover = ({ onClose }) => {
  const t = useI18nContext();

  return (
    <Popover
      title={t('editGasFeeModalTitle')}
      onClose={onClose}
      className="edit-gas-fee-popover"
    >
      <>
        {process.env.IN_TEST === 'true' ? null : <LoadingHeartBeat />}
        <div className="edit-gas-fee-popover__wrapper">
          <div className="edit-gas-fee-popover__content">
            <div className="edit-gas-fee-popover__content__header">
              <span className="edit-gas-fee-popover__content__header-option">
                <I18nValue messageKey="gasOption" />
              </span>
              <span className="edit-gas-fee-popover__content__header-time">
                <I18nValue messageKey="time" />
              </span>
              <span className="edit-gas-fee-popover__content__header-max-fee">
                <I18nValue messageKey="maxFee" />
              </span>
            </div>
            <EditGasItem estimateType={GAS_ESTIMATE.LOW} onClose={onClose} />
            <EditGasItem estimateType={GAS_ESTIMATE.MEDIUM} onClose={onClose} />
            <EditGasItem estimateType={GAS_ESTIMATE.HIGH} onClose={onClose} />
            <div className="edit-gas-fee-popover__content__separator" />
            <EditGasItem
              estimateType={GAS_ESTIMATE.DAPP_SUGGESTED}
              onClose={onClose}
            />
            <EditGasItem estimateType={GAS_ESTIMATE.CUSTOM} onClose={onClose} />
            <NetworkStatus />
            <Typography
              className="edit-gas-fee-popover__know-more"
              align="center"
              color={COLORS.UI4}
              fontSize="12px"
            >
              <I18nValue
                messageKey="learmMoreAboutGas"
                options={[
                  <a
                    key="learnMoreLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://community.metamask.io/t/what-is-gas-why-do-transactions-take-so-long/3172"
                  >
                    <I18nValue messageKey="learnMore" />
                  </a>,
                ]}
              />
            </Typography>
          </div>
        </div>
      </>
    </Popover>
  );
};

EditGasFeePopover.propTypes = {
  onClose: PropTypes.func,
};

export default EditGasFeePopover;
