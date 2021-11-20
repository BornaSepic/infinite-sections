import Axios from "axios";
import { getSessionToken } from "@shopify/app-bridge-utils";

const generateApiInstance = async (app) => {
  const api = Axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_HOST}/`,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  api.interceptors.request.use(async function (config) {
    return await getSessionToken(app) // requires an App Bridge instance
      .then((token) => {
        // append your request headers with an authenticated token
        config.headers["Authorization"] = `Bearer ${token}`;
        return config;
      });
  });

  return api;
};

export default generateApiInstance;
