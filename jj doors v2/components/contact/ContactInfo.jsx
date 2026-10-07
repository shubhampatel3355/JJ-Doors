import { contactInfo2 } from "@/data/contactInfo";
import Image from "next/image";
import React from "react";

export default function ContactInfo() {
  return (
    <div className="feature-area-1 space">
      <div className="container">
        <div className="row gy-4 align-items-stretch justify-content-center">
          {contactInfo2.map((info, index) => (
            <div key={index} className="col-xl-3 col-lg-6 col-md-6">
              <div className="feature-card h-100 d-flex flex-column justify-content-between p-4 bg-white border rounded-3 shadow-sm">
                <div>
                  <div className="feature-card-icon mb-4">
                    <Image width={36} height={40} src={info.iconSrc} alt="icon" />
                  </div>
                  <div className="feature-card-details">
                    <h4 className="feature-card-title mb-2">
                      <a href={info.linkUrl}>{info.title}</a>
                    </h4>
                    {info.subtitle && (
                      <p className="feature-card-text fw-medium text-dark mb-1">
                        {info.subtitle}
                      </p>
                    )}
                    {info.line1 && (
                      <p className="feature-card-text text-muted mb-0">
                        {info.line1}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 pt-2">                  <a href={info.linkUrl} className="link-btn">
                    <span className="link-effect">
                      <span className="effect-1">{info.linkText}</span>
                      <span className="effect-1">{info.linkText}</span>
                    </span>
                    <Image
                      width={13}
                      height={13}
                      src="/assets/img/icon/arrow-left-top.svg"
                      alt="icon"
                    />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
