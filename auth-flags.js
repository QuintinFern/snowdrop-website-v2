/**
 * LOGIN_ENABLED: public login rollout flag.
 * Secret phrase (typed anywhere on the site) reveals Login in the nav via session storage.
 */
export const LOGIN_ENABLED = false;

export const LOGIN_UNLOCK_PHRASE = '###snowdropslaysfr';

const UNLOCK_STORAGE_KEY = 'snowdropLoginUnlocked';

export function isLoginNavVisible() {
    return LOGIN_ENABLED || sessionStorage.getItem(UNLOCK_STORAGE_KEY) === '1';
}

export function unlockLoginNavFromSecret() {
    sessionStorage.setItem(UNLOCK_STORAGE_KEY, '1');
}
