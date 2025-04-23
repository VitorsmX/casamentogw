<<<<<<< HEAD
import { progress } from "./progress.js";
import { cache } from "../../common/cache.js";
=======
import { progress } from './progress.js';
import { cache } from '../../connection/cache.js';
>>>>>>> 1193ec6bbb341a62eaa59d49371d87a5538256af

export const image = (() => {
  /**
   * @type {NodeListOf<HTMLImageElement>|null}
   */
  let images = null;

  let hasSrc = false;

  /**
   * @type {object[]}
   */
  const urlCache = [];

  /**
   * @param {HTMLImageElement} el
   * @param {string} src
   * @returns {Promise<void>}
   */
  const appendImage = (el, src) =>
    new Promise((res) => {
      const img = new Image();

      img.onload = () => {
        el.src = img.src;
        el.width = img.naturalWidth;
        el.height = img.naturalHeight;
        progress.complete("image");
        img.remove();
        res();
      };

      img.src = src;
    });

  /**
   * @param {HTMLImageElement} el
   * @returns {void}
   */
  const getByFetch = (el) => {
    const src = el.getAttribute("data-src")

    urlCache.push({
      url: src,
      res: (url) => appendImage(el, url),
      rej: () => progress.invalid("image"),
    });
  };

  /**
   * @param {HTMLImageElement} el
   * @returns {void}
   */
  const getByDefault = (el) => {
    el.onerror = () => progress.invalid("image");
    el.onload = () => {
      el.width = el.naturalWidth;
      el.height = el.naturalHeight;
      progress.complete("image");
    };

    if (el.complete && el.naturalWidth !== 0 && el.naturalHeight !== 0) {
      progress.complete("image");
    } else if (el.complete) {
      progress.invalid("image");
    }
  };

  /**
   * @returns {boolean}
   */
  const hasDataSrc = () => hasSrc;

  /**
   * @returns {Promise<void>}
   */
  const load = async () => {
    const arrImages = Array.from(images);

    arrImages
      .filter((el) => el.getAttribute("data-fetch-img") !== "high")
      .forEach((el) => {
        el.hasAttribute("data-src") ? getByFetch(el) : getByDefault(el);
      });

    if (!hasSrc) {
      return;
    }

    const c = cache("images");
    await c.open();
    await Promise.all(
      arrImages
        .filter((el) => el.getAttribute("data-fetch-img") === "high")
        .map((el) => {
          return c
            .get(el.getAttribute("data-src"))
            .then((i) => appendImage(el, i))
            .then(() => el.classList.remove("opacity-0"));
        })
    );
    await c.run(urlCache);
  };

<<<<<<< HEAD
  /**
   * @returns {object}
   */
  const init = () => {
    images = document.querySelectorAll("img");
=======
        const c = cache('image');
        const cancel = new Promise((res) => document.addEventListener('progress.invalid', res, { once: true }));

        await c.open();
        await Promise.allSettled(arrImages.filter((el) => el.getAttribute('data-fetch-img') === 'high').map((el) => {
            return c.get(el.getAttribute('data-src'), cancel)
                .then((i) => appendImage(el, i))
                .then(() => el.classList.remove('opacity-0'));
        }));
        await c.run(urlCache, cancel);
    };
>>>>>>> 1193ec6bbb341a62eaa59d49371d87a5538256af

    images.forEach(progress.add);
    hasSrc = Array.from(images).some((i) => i.hasAttribute("data-src"));

    return {
      load,
      hasDataSrc,
    };
  };

  return {
    init,
  };
})();
