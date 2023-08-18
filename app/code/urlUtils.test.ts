import { sanitizeUrl } from "./urlUtils";

test("urls parse correctly", () => {
  const invalidUrls = [
    "invalid",
    "not a website",
    "foo.co etc",
    "some??thing.com",
  ];

  invalidUrls.forEach((url) => {
    const u = sanitizeUrl(url);
    expect(u).toBeNull();
  });

  const validUrls = [
    { i: "www.example.com", o: "www.example.com" },
    { i: "subdomain.example.com", o: "subdomain.example.com" },
    { i: "https://www.example.com", o: "www.example.com" },
    { i: "example.com", o: "example.com" },
    { i: "https://example.com", o: "example.com" },
    { i: "www.example.com?param=foo", o: "www.example.com?param=foo" },
    { i: "example.com?p=one&o=two", o: "example.com?p=one&o=two" },
    {
      i: "famewall.io?utm_source=famewall_twitter",
      o: "famewall.io?utm_source=famewall_twitter",
    },
    {i:"www.drippi.ai/_", o:"www.drippi.ai/_"},
    {i:"https://www.drippi.ai/?utm_id=jan%27", o:"www.drippi.ai/?utm_id=jan%27"}
  ];

  validUrls.forEach((url) => {
    const u = sanitizeUrl(url.i);
    const expected = `${url.i} -> ${url.o}`;
    const actual = `${url.i} -> ${u}`;
    expect(actual).toEqual(expected);
  });
});
