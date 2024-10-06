import { ENDPOINT } from "./defaults";

export function getLogin(userId) {
  return fetch(ENDPOINT + "/login" + `?userid=${userId}`);
}

export async function getToken(userId) {
  const res = await fetch(ENDPOINT + "/token" + `?userid=${userId}`, {
    headers: {
      Accepts: "application/text",
    },
  });
  if (res.status != 202) return "";

  return await res.text();
}

export async function checkToken(userId, token) {
  const res = await fetch(ENDPOINT + "/validate" + `?userid=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status === 200;
}

export function getPointsOfInterest(userId, token) {
  console.log(`sending poi request ${userId} ${token}`);
  return fetch(`${ENDPOINT}/poi?userid=${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
