import { getCookie, setCookie } from "./cookies";
import { ENDPOINT } from "./defaults";

export function getLogin(userId) {
  return fetch(ENDPOINT + "/login" + `?userid=${userId}`);
}

export async function getToken(userId) {
  const currentToken = getCookie("usertoken");
  if (currentToken && (await checkToken(userId, currentToken))) {
    console.debug(
      `[LOGIN] current token is still valid! token:'${currentToken}'`
    );
    setCookie("usertoken", currentToken, 30);
    return currentToken;
  }

  return newToken(userId);
}

export async function newToken(userId) {
  console.debug("[LOGIN] getting new token...");

  const res = await fetch(ENDPOINT + "/token" + `?userid=${userId}`, {
    headers: {
      Accepts: "application/text",
    },
  });
  if (res.status != 202) return "";

  const token = await res.text();

  setCookie("usertoken", token, 30);

  return token;
}

export async function checkToken(userId, token) {
  console.debug("[LOGIN] checking current token...");
  if (!token) {
    console.warn(`[LOGIN] current token is falsey! had: '${token}'`);
    return false;
  }

  console.debug(`[LOGIN] checking current token status...`);
  const res = await fetch(ENDPOINT + "/validate" + `?userid=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  console.debug(
    `[LOGIN] current token status: ${res.status} - ${res.statusText}`
  );
  return res.status === 202;
}

export function getPointsOfInterest(userId, token) {
  console.debug(`[POI] sending poi request ${userId} ${token}`);
  return fetch(`${ENDPOINT}/poi?userid=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function setPointsOfInterest(userId, token, poi) {
  const body = JSON.stringify(poi);

  // send the site update.
  const res = await fetch(`${ENDPOINT}/poi?userid=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
    method: "POST",
    body,
  });
}
