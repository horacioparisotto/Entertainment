import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import db from "../firebase";
import "./PlansScreen.css";
import { loadStripe } from "@stripe/stripe-js";

function PlansScreen() {
  const [products, setProducts] = useState([]);
  const user = useSelector(selectUser);
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    db.collection("customers")
      .doc(user.uid)
      .collection("subscriptions")
      .get()
      .then((querySnapshot) => {
        querySnapshot.forEach((subscriptionDoc) => {
          setSubscription({
            role: subscriptionDoc.data().role,
            current_period_end: subscriptionDoc.data().current_period_end.seconds,
            current_period_start: subscriptionDoc.data().current_period_start.seconds,
          });
        });
      });
  }, [user.uid]);

  useEffect(() => {
    db.collection("products")
      .where("active", "==", true)
      .get()
      .then(async (querySnapshot) => {
        const products = {};
        const productDocs = querySnapshot.docs;

        await Promise.all(productDocs.map(async (productDoc) => {
          const productData = productDoc.data();
          const priceSnap = await productDoc.ref.collection("prices").get();
          const prices = priceSnap.docs.map(price => ({
            priceId: price.id,
            priceData: price.data(),
          }));

          products[productDoc.id] = {
            ...productData,
            prices,
          };
        }));

        setProducts(products);
      });
  }, []);

  const loadCheckout = async (priceId) => {
    const docRef = await db
      .collection("customers")
      .doc(user.uid)
      .collection("checkout_sessions")
      .add({
        price: priceId,
        success_url: window.location.origin,
        cancel_url: window.location.origin,
      });

    docRef.onSnapshot(async (snap) => {
      const { error, sessionId } = snap.data();

      if (error) {
        alert(`An error occurred: ${error.message}`);
      }

      if (sessionId) {
        const stripe = await loadStripe("pk_test_51PQYGBHeOEXBm9rmG2tVYqM2LAbsNByAztgJhmqbUAz0ynlmho4khJgnffzLC42XhnSDmpyC94V4rHHXIh68CqMs00QOGHB5KZ");
        stripe.redirectToCheckout({ sessionId });
      }
    });
  };

  return (
    <div className="plansScreen">
      <br />
      {subscription && (
        <p className="renewalDate">
          Renewal date: {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
        </p>
      )}
      {Object.entries(products).map(([productId, productData]) => {
        const isCurrentPackage = productData.name?.toLowerCase().includes(subscription?.role);

        return (
          <div
            key={productId}
            className={`plansScreen__plan ${isCurrentPackage && "plansScreen__plan--disabled"}`}
          >
            <div className="plansScreen__info">
              <h5>{productData.name}</h5>
              <h6>{productData.description}</h6>
            </div>

            {productData.prices.map((price) => (
              <button
                key={price.priceId}
                onClick={() => !isCurrentPackage && loadCheckout(price.priceId)}
              >
                {isCurrentPackage ? "Current Plan" : `Subscribe`}
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export default PlansScreen;
