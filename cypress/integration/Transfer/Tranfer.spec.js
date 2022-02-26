/// <reference types="cypress" />

const contents = {
	pageMain: "PERSONAL",
	linkSignIn: "Sign In",
	LinkSignOff: "Sign Off",
	siteProfile: "Hello",
	Transfer: "Transfer Funds"
}
const value = {
	tranferValue: 30000,
	userName: "Jsmith",
	password: "Demo1234"
}
const message = {
	Err: "Login Failed: We're sorry, but this username or password was not found in our system. Please try again.",
	AlertInvalidValue: 'Transfer Amount must be a number greater than 0.',
	AlertFromToEquals: "From Account and To Account fields cannot be the same.",
	successTransfer: `${value.tranferValue}.0 was successfully transferred from Account 800003 into Account 4539082039396288`
}

describe('Transfer of funds between accounts', () => {
    context('when you enter the main page', () => {
        it('should go to the page', () => {
            cy.visit('https://demo.testfire.net/index.jsp')
            cy.contains(contents.pageMain).should('be.visible')
            cy.contains(contents.linkSignIn).should('be.visible')
        })
    })
    context('when you click on Sign In', () => {
        it('should redirect to login', () => {
            cy.get('#LoginLink')
                .click()
                .wait(1000)
            cy.contains('Online Banking Login').should('be.visible')
        })
        context('when the data is not correct', () => {
            it('should return error message', () => {
                cy.get('#uid').type('usernameincorrect')
                    .get('#passw').type('passwordIncorrect')
                    .get('[name="btnSubmit"]').click().wait(500)
                cy.contains(message.Err).should('be.visible')
            })
        })
        context('when the data is correct', () => {
            it('should go to the site', () => {
                cy.get('#uid').type(value.userName)
                    .get('#passw').type(value.password)
                    .get('[name="btnSubmit"]').click().wait(500)
                cy.contains(contents.siteProfile).should('be.visible')
                cy.contains(contents.LinkSignOff)
                    .get('#MenuHyperLink3').click()
            })
            context('when select the Transfer Funds option', () => {
                it('should redirect to Transfer Funds', () => {
                    cy.contains(contents.Transfer).should('be.visible')
				})
				context('when the transfer value is not correct', () => {
					it('should show alert with error message when value is 0', () => {
						cy.get('#fromAccount').select(1).should('have.value', '800003')
							.get('#toAccount').select(2).should('have.value', '4539082039396288')
							.get('#transferAmount').type('0')
							.get('#transfer').click()
						cy.on('window:alert', (m) => {
							expect(m).to.equal(message.AlertInvalidValue)
						})
					})
					it('should show alert with error message when value is Text', () => {
						cy.get('#fromAccount').select(1).should('have.value', '800003')
							.get('#toAccount').select(2).should('have.value', '4539082039396288')
							.get('#transferAmount').type('abcd')
							.get('#transfer').click()
						cy.on('window:alert', (m) => {
							expect(m).to.equal(message.AlertInvalidValue)
						})
					})
				})
				context('when "From Account" equals "To Account"',() => {
					it('should show window with error message', () => {
						cy.get('#fromAccount').select(0).should('have.value', '800002')
							.get('#toAccount').select(0).should('have.value', '800002')
							.get('#transferAmount').clear()
							.get('#transferAmount').type(value.tranferValue)
							.get('#transfer').click()
						cy.on('window:alert', (m) => {
							expect(m).to.eq(message.AlertFromToEquals)
						})
					})
				})
				context('when the transfer is correct', () => {
					it('should show success message', () => {
						
						cy.get('#fromAccount').select(1).should('have.value', '800003')
							.get('#toAccount').select(2).should('have.value', '4539082039396288')
							.get('#transferAmount').clear()
							.get('#transferAmount').type(value.tranferValue)
							.get('[name="transfer"]').click() // Aqui se presenta un problema, al momento de dar click se realiza un reload y se cierra la sesión sin mostrar el mensaje de transferencia exitosa, sin embargo este fue un caso de prueba que se tiene en cuenta con respecto al coverage
						cy.contains(message.successTransfer)
					})
				})
			})
        })
    })
})