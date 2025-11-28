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
  sites.forEach((siteID) => {
    prices[siteID] = returnedSites[siteID] || 0;
  });

  return prices;
}

export async function getHistoricPrices() {
  const res = await fetch(ENDPOINT + "/api/v1/history");
  if (res.status != 200) {
    console.warn("unable to reach server.");
    return { dates: [], datasets: [] };
  }
  return await res.json();
}
