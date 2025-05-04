const chai = require("chai");
const chaiHttp = require("chai-http");
const dotenv = require("dotenv");
const fs = require("fs");

dotenv.config();
chai.use(chaiHttp); 

const { expect } = chai; 


const BASE_URL = process.env.BASE_URL;
const USER_NAME = process.env.USER_NAME;
const PASSWORD = process.env.PASSWORD;

const bookingData = JSON.parse(
	fs.readFileSync("./data/bookingData.json", "utf-8")
);

describe("End to End API Mocha Chai Booking", function () {
	let token;
	let bookingId;

	it("Auth - Create Token", function (done) {
        chai
          .request(BASE_URL) 
          .post("/auth")
          .set("Content-Type", "application/json")
          .send({ username: USER_NAME, password: PASSWORD })
          .end(function (err, res) {
            console.log("Response Body:", res.body); // Log untuk melihat response
            expect(res).to.have.status(200);
            expect(res.body).to.have.property("token");
            token = res.body.token;
            done();
          });
      });      
      

	it("Booking - Create Booking", function (done) {
		chai
			.request(BASE_URL)
			.post("/booking")
			.set("Content-Type", "application/json")
			.set("Accept", "application/json")
			.set("Authorization", `Bearer ${token}`)
			.send(bookingData)
			.then((res) => {
				expect(res).to.have.status(200);
				expect(res.body).to.have.property("bookingid");
				expect(res.body).to.have.property("booking");
				expect(res.body.booking.firstname).to.equal(bookingData.firstname);
				expect(res.body.booking.lastname).to.equal(bookingData.lastname);
				bookingId = res.body.bookingid;
				// console.log("Created booking ID:", bookingId); 
                //console.log("Response Body:", res.body); --> buat liat log
				done();
			})
			.catch((err) => {
				console.error("Error during booking:", err);
				done(err);
			});
	});

	it("Get Booking - List", async function () {
		const res = await chai
			.request(BASE_URL)
			.get("/booking")
			.set("Authorization", `Bearer ${token}`);

		expect(res).to.have.status(200);
		expect(res.body).to.be.an("array");
		expect(res.body).to.have.length.greaterThan(0);
	});

	it("Spesific Booking ID", function (done) {
		chai
			.request(BASE_URL)
			.get(`/booking/${bookingId}`)
			.set("Authorization", `Bearer ${token}`)
			.set("Accept", "application/json")
			.end(function (err, res) {
				expect(res).to.have.status(200);
				expect(res.body).to.have.property("firstname");
				expect(res.body).to.have.property("lastname");
				done();
			});
	});

    it("Delete spesific Booking ID", function (done) {
        //console.log("Token:", token);  --> Log untuk liat token
        //console.log("Booking ID:", bookingId);  --> Log untuk liat bookingId
    
        chai
          .request(BASE_URL)
          .delete(`/booking/${bookingId}`) 
          .set("Content-Type", "application/json")
          .set("Cookie", `token=${token}`) // Token dikirim sebagai Cookie
          .end(function (err, res) {
            if (err) {
              console.error("Error during delete request:", err); 
              done(err);
              return;
            }
    
            // Debugging log untuk respons
            console.log("Response Status:", res.status); 
            console.log("Response Body:", res.body); 
            
            expect(res.status).to.equal(201); 
    
            done();
          });
    });
    
      
});