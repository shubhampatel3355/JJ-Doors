import Link from "next/link";
import React from "react";
import { legalContact } from "@/data/legal";

export default function LegalPage({ title, lastUpdated, intro, sections, crossLink }) {
  return (
    <>
      <div
        className="breadcumb-wrapper"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(10, 12, 0, 0.65) 0%, rgba(10, 12, 0, 0.45) 50%, rgba(10, 12, 0, 0.75) 100%), url(/assets/img/background/bg.png)",
        }}
      >
        <div className="container">
          <div className="breadcumb-content">
            <h1 className="breadcumb-title">{title}</h1>
          </div>
        </div>
      </div>

      <section className="legal-area space">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-xl-8 col-lg-10">
              <p className="legal-updated">Last updated: {lastUpdated}</p>
              {intro.map((text, i) => (
                <p key={i} className="legal-text">
                  {text}
                </p>
              ))}

              {sections.map((section, i) => (
                <div key={section.heading} className="legal-section">
                  <h2 className="legal-heading">
                    {i + 1}. {section.heading}
                  </h2>
                  {section.paragraphs?.map((text, j) => (
                    <p key={j} className="legal-text">
                      {text}
                    </p>
                  ))}
                  {section.list && (
                    <ul className="legal-list">
                      {section.list.map((item, j) =>
                        typeof item === "string" ? (
                          <li key={j}>{item}</li>
                        ) : (
                          <li key={j}>
                            <strong>{item.label}:</strong> {item.text}
                          </li>
                        )
                      )}
                    </ul>
                  )}
                  {section.closing?.map((text, j) => (
                    <p key={j} className="legal-text">
                      {text}
                    </p>
                  ))}
                </div>
              ))}

              <div className="legal-section">
                <h2 className="legal-heading">
                  {sections.length + 1}. Contact Us
                </h2>
                <p className="legal-text">
                  If you have any questions about this {title.toLowerCase()}, please contact us:
                </p>
                <ul className="legal-contact">
                  <li>
                    <strong>{legalContact.business}</strong>
                  </li>
                  <li>{legalContact.person}</li>
                  <li>{legalContact.location}</li>
                  <li>
                    Phone: <a href={legalContact.phoneUrl}>{legalContact.phone}</a>
                  </li>
                  <li>
                    Email: <a href={`mailto:${legalContact.email}`}>{legalContact.email}</a>
                  </li>
                </ul>
              </div>

              {crossLink && (
                <p className="legal-crosslink">
                  Please also read our{" "}
                  <Link scroll={false} href={crossLink.href}>
                    {crossLink.text}
                  </Link>
                  .
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
