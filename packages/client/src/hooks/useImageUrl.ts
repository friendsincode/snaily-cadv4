import { getAPIUrl } from "lib/fetch/getAPIUrl";
import { IMGUR_REGEX } from "@snailycad/config";

type ImageURLTypes = "citizens" | "users" | "bleeter" | "units" | "cad" | "values";

export function useImageUrl() {
  function makeImageUrl(type: ImageURLTypes, id: string | null) {
    if (!id) return;

    if (id.match(IMGUR_REGEX)) {
      return id;
    }

    const url = getAPIUrl().replace("/v1", "");
    const IMAGE_URL = `${url}/static/`;

    return `${IMAGE_URL}${type}/${id}`;
  }

  return { makeImageUrl };
}
