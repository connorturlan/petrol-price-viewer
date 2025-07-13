import { ENDPOINT } from "../utils/defaults";

// getFuelPrices
export async function getFuelPrices(
  fuelType: number,
  sites: string[],
  timeout: number = 5_000
): Promise<[number, number][]> {
  const req = fetch(ENDPOINT + `/prices?fuelType=${fuelType}`, {
    method: "POST",
    body: JSON.stringify(sites),
  });

  const request = new Promise<Response>((accept, reject) => {
    let accepted = false;

    setTimeout(() => {
      if (accepted) return;

      window.alert("Prices request timed out, try again later.");
      reject();
      return [];
    }, timeout);

    req.then((data) => {
      accepted = true;
      accept(data);
    });
  });

  const res = await request;
  if (res.status != 200) {
    window.alert("error while handling site prices. please try again later");
    return [];
  }

  const returnedSites = await res.json();

  const prices = [] as [number, number][];
  sites.forEach((siteid) => {
    prices[siteid] = returnedSites[siteid] || 0;
  });

  console.log(prices);

  return prices;
}

export async function getHistoricPrices() {
  const res = await fetch(ENDPOINT + "/history");
  if (res.status != 200) {
    console.warn("unable to reach server.");
    return;
  }
  return await res.json();
}
