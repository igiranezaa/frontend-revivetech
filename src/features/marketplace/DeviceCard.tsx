import { useEffect, useState } from "react";
import { ArrowRight, BatteryMedium, CheckCircle2, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { Listing } from "./types";
import { getMarketplaceListings } from "../../lib/api";
import "./DeviceCard.css";

function conditionClass(condition: string) {
  const value = condition.toLowerCase();
  if (value === "excellent" || value === "new") return "home-device-condition--excellent";
  if (value === "good") return "home-device-condition--good";
  return "home-device-condition--fair";
}

export default function DeviceCard() {
  const [trendingListings, setTrendingListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    getMarketplaceListings()
      .then((items) => {
        if (alive) setTrendingListings(items.slice(0, 6));
      })
      .catch(() => {
        if (alive) setTrendingListings([]);
      })
      .finally(() => {
        if (alive) setIsLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="home-device-section" aria-labelledby="trending-devices-title">
      <div className="home-device-heading">
        <div>
          <p className="home-device-eyebrow">
            <span />
            Curated inventory
          </p>
          <h2 id="trending-devices-title">Trending Devices</h2>
          <p>Certified refurbished technology, priced for everyday ownership.</p>
        </div>

        <Link to="/marketplace" className="home-device-marketplace-link">
          Explore all devices
          <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="home-device-grid" aria-label="Loading featured devices">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="home-device-skeleton" key={index} />
          ))}
        </div>
      ) : trendingListings.length === 0 ? (
        <div className="home-device-empty">
          <ShieldCheck size={22} />
          <p>No certified listings are active yet.</p>
        </div>
      ) : (
        <div className="home-device-grid">
          {trendingListings.map((device) => {
            const monthlyPrice = Math.ceil(device.current_price / 12);

            return (
              <article className="home-device-card" key={device.id}>
                <Link to={`/marketplace/${device.id}`} className="home-device-image-wrap" aria-label={`View ${device.title}`}>
                  <img src={device.img} alt={device.title} loading="lazy" />
                  <span className="home-device-category">{device.category}</span>
                  <span className={`home-device-condition ${conditionClass(device.condition)}`}>
                    <CheckCircle2 size={11} />
                    {device.condition}
                  </span>
                </Link>

                <div className="home-device-body">
                  <div>
                    <h3>{device.title}</h3>
                    <div className="home-device-meta">
                      <span><BatteryMedium size={14} />{device.batteryHealth ?? 100}% battery</span>
                      <span><ShieldCheck size={14} />{device.trustScore ?? 100} trust</span>
                    </div>
                  </div>

                  <div className="home-device-price-row">
                    <div>
                      <strong>${device.current_price.toLocaleString()}</strong>
                      <del>${device.original_price.toLocaleString()}</del>
                    </div>
                    <span>From ${monthlyPrice}/mo</span>
                  </div>

                  <Link to={`/marketplace/${device.id}`} className="home-device-details-link">
                    View details
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
