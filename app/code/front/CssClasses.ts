import { AB_FLAGS, getAbFlag } from "../abUtils";

export const CSS_CLASSES = {
  LABEL: "block font-bold text-gray-700 mb-2",
  INPUT_FIELD:
    "border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2",
  ERROR_CLASS: "text-red-500 text-sm italic mb-2",
  SUBMIT_BUTTON:
    "bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
  BUTTON_DISABLED:
    "bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
  CANCEL_BUTTON:
    "bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline",
  ITEM_TAG:
    "inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mt-2",
  SECTION_BG: "bg-gray-100 shadow-md p-4",
  ITEM_GRID_COLS: "grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
};

export function CSS_ACTIVIST_CLASSES(ipab: number) {
  const colorAB = getAbFlag(ipab, AB_FLAGS.COLOR);

  const linkColor = colorAB ? "text-green-500 hover:text-green-600" : "text-purple-500 hover:text-purple-700";

  return {
    navButton: "text-white text-sm font-semibold hover:text-gray-300 px-4",
    title: "text-xl font-bold py-2",
    navColor: colorAB ? "bg-teal-700" : "bg-purple-800", // "bg-gray-800";

    linkNormal: linkColor,
    contentsLink: "text-lg " + linkColor,
    textFaded: "text-gray-500 text-sm py-2",
    sectionWhite: " py-4 px-4 lg:px-8",
    sectionFooter: (colorAB ? "bg-teal-50" : "bg-purple-200") + " py-1",
    sectionBody: "py-4 px-4 lg:px-8 bg-gradient-to-b from-white " + (colorAB ? "to-teal-50" : "to-purple-200")
  };
}
