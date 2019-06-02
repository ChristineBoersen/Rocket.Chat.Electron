import { css } from '@emotion/core';
import styled from '@emotion/styled';
import { remote } from 'electron';
import React from 'react';
import { connect } from 'react-redux';
import i18n from '../../i18n';
import { Button } from '../ui/Button';
import { Modal, ModalActions, ModalTitle } from '../ui/Modal';
import { skipUpdate, hideModal, downloadUpdate } from '../../store/actions';
const { app, dialog, getCurrentWindow } = remote;


const ModalContent = styled.div`
	display: flex;
	flex-flow: column nowrap;
	flex: 1;
	align-items: center;
	justify-content: center;
	margin: 2.5rem 1rem;
`;

const Message = styled.p`
	margin: 0 0 1rem;
	line-height: normal;
`;

const UpdateInfoSection = styled.section`
	display: flex;
	align-items: center;
`;

const AppVersionOuter = styled.div`
	flex: 1;
	margin: 1rem;
	text-align: center;
	white-space: nowrap;
	line-height: normal;
`;

const AppVersionInner = styled.div`
	font-size: 1.5rem;
	font-weight: bold;
	${ ({ current }) => current && css`
		color: var(--color-dark-30);
	` }
`;

const AppVersionUpdateArrow = styled.div`
	flex: 1;
	margin: 1rem;
	font-size: 2rem;
`;

const AppVersion = ({ label, version, current = false }) => (
	<AppVersionOuter>
		<div>{label}</div>
		<AppVersionInner current={current}>
			{version || 'x.y.z'}
		</AppVersionInner>
	</AppVersionOuter>
);

const mapStateToProps = ({
	modal,
	update: {
		version,
	},
}) => ({
	open: modal === 'update',
	newVersion: version,
});

const warnItWillSkipVersion = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.updateSkip.title'),
		message: i18n.__('dialog.updateSkip.message'),
		type: 'warning',
		buttons: [i18n.__('dialog.updateSkip.ok')],
		defaultId: 0,
	}, () => resolve());
});

const informItWillDownloadUpdate = () => new Promise((resolve) => {
	dialog.showMessageBox(getCurrentWindow(), {
		title: i18n.__('dialog.updateDownloading.title'),
		message: i18n.__('dialog.updateDownloading.message'),
		type: 'info',
		buttons: [i18n.__('dialog.updateDownloading.ok')],
		defaultId: 0,
	}, () => resolve());
});

const mapDispatchToProps = (dispatch) => ({
	onClickSkip: async () => {
		await warnItWillSkipVersion();
		dispatch(skipUpdate());
	},
	onClickRemindLater: () => {
		dispatch(hideModal());
	},
	onClickInstall: async () => {
		await informItWillDownloadUpdate();
		dispatch(downloadUpdate());
	},
});

export const UpdateModal = connect(mapStateToProps, mapDispatchToProps)(
	function UpdateModal({ open, currentVersion, newVersion, onClickSkip, onClickRemindLater, onClickInstall }) {
		return open && (
			<Modal open>
				<ModalContent>
					<ModalTitle>{i18n.__('dialog.update.announcement')}</ModalTitle>

					<Message>{i18n.__('dialog.update.message')}</Message>

					<UpdateInfoSection>
						<AppVersion
							label={i18n.__('dialog.update.currentVersion')}
							version={currentVersion || app.getVersion()}
							current
						/>

						<AppVersionUpdateArrow>
							→
						</AppVersionUpdateArrow>

						<AppVersion
							label={i18n.__('dialog.update.newVersion')}
							version={newVersion}
						/>
					</UpdateInfoSection>
				</ModalContent>

				<ModalActions>
					<Button secondary onClick={onClickSkip}>{i18n.__('dialog.update.skip')}</Button>
					<Button secondary onClick={onClickRemindLater}>{i18n.__('dialog.update.remindLater')}</Button>
					<Button primary onClick={onClickInstall}>{i18n.__('dialog.update.install')}</Button>
				</ModalActions>
			</Modal>
		);
	}
);
