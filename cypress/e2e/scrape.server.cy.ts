describe("getLatestSnapshot", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000/scout");
  });

  it('should display "Last Updated and Time Updated Source from wayback machine " with the correct data when the request is successful', () => {
    const identifier = "youtube.com";

    cy.get('input[name="url"]', { timeout: 5000 })
      .should("be.visible")
      .then(($input) => {
        $input.val(identifier);
      });

    cy.get('button[type="submit"]', { timeout: 5000 })
      .should("exist")
      .should("be.visible")
      .click({ force: true });

    cy.get('[data-test="jsonDisplay"]')
      .should("exist")
      .invoke("text")
      .then((jsonText) => {
        const jsonData = JSON.parse(jsonText);
        expect(jsonData.info.timeUpdatedSource).to.equal("archive.org");
        const timeStampDate = new Date(jsonData.info.timeUpdated * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        expect(timeStampDate >= twentyFourHoursAgo).to.be.true;
      });
  });

  it('should display "Last Updated and Time Updated Source from twitters " with the correct data when the request is successful', () => {
    const identifier = "espn.com";

    cy.get('input[name="url"]', { timeout: 5000 })
      .should("be.visible")
      .then(($input) => {
        $input.val(identifier);
      });

    cy.get('button[type="submit"]', { timeout: 5000 })
      .should("exist")
      .should("be.visible")
      .click({ force: true });

    cy.get('[data-test="jsonDisplay"]')
      .should("exist")
      .invoke("text")
      .then((jsonText) => {
        const jsonData = JSON.parse(jsonText);
        expect(jsonData.info.timeUpdatedSource).to.equal("twitter.com");
        const timeStampDate = new Date(jsonData.info.timeUpdated * 1000);
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        expect(timeStampDate >= twentyFourHoursAgo).to.be.true;
      });
  });
});