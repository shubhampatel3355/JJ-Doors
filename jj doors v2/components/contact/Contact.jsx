"use client";

export default function Contact() {
  return (
    <div className="contact-area-1 space bg-title shape-mockup-wrap overflow-hidden">
      <div
        className="contact-map shape-mockup wow img-custom-anim-left animated"
        data-wow-duration="1.5s"
        data-wow-delay="0.2s"
        style={{ top: "0px", left: 0, bottom: "0px", height: "100%" }}
      >
        <iframe
          src="https://maps.google.com/maps?q=Bangalore%2C%20Karnataka%2C%20India&t=m&z=11&output=embed&iwloc=near"
          allowFullScreen=""
          loading="lazy"
          title="JJ Doors Location"
          style={{ width: "100%", height: "100%", border: 0 }}
        ></iframe>
      </div>
      <div className="container">
        <div className="row align-items-center justify-content-end">
          <div className="col-lg-6">
            <div className="contact-form-wrap">
              <div className="title-area mb-30">
                <span className="sub-title">GET IN TOUCH</span>
                <h2 className="sec-title text-white">
                  Have a Custom Door Project in <span className="text-theme">Mind?</span>
                </h2>
                <p className="text-white" style={{ opacity: 0.85 }}>
                  We would love to hear from you! Share your door requirements, dimensions, or custom design ideas and our expert team will get back to you promptly.
                </p>
              </div>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="contact-form ajax-contact"
              >
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        required
                        type="text"
                        className="form-control style-border placeholder-white"
                        style={{
                          color: "#fff",
                          borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                        name="name"
                        id="name"
                        placeholder="Full name*"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <input
                        required
                        type="email"
                        className="form-control style-border placeholder-white"
                        style={{
                          color: "#fff",
                          borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                        name="email"
                        id="email"
                        placeholder="Email address*"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <input
                        required
                        type="text"
                        className="form-control style-border placeholder-white"
                        style={{
                          color: "#fff",
                          borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                        name="subject"
                        id="subject"
                        placeholder="Subject / Door Type*"
                      />
                    </div>
                  </div>
                  <div className="col-lg-12">
                    <div className="form-group">
                      <textarea
                        required
                        name="message"
                        placeholder="Tell us about your requirements (Wood type, Dimensions, Quantity)*"
                        id="contactForm"
                        className="form-control style-border placeholder-white"
                        style={{
                          color: "#fff",
                          borderBottom: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                        rows={4}
                      ></textarea>
                    </div>
                  </div>
                </div>
                <div className="form-btn col-12">
                  <button type="submit" className="btn style2 mt-20">
                    <span className="link-effect">
                      <span className="effect-1">SEND ENQUIRY</span>
                      <span className="effect-1">SEND ENQUIRY</span>
                    </span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
