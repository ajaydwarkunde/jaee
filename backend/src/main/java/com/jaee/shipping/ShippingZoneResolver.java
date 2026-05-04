package com.jaee.shipping;

import com.jaee.entity.Address;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

/**
 * Maps a delivery address to a zone column from the carrier rate card.
 * Origin (warehouse) defaults to Mumbai, Maharashtra — tune via app.shipping.*.
 */
@Component
public class ShippingZoneResolver {

    @Value("${app.shipping.origin-city:Mumbai}")
    private String originCity;

    @Value("${app.shipping.origin-state:Maharashtra}")
    private String originState;

    private static final Set<String> METRO_CITIES = Set.of(
            "mumbai", "delhi", "new delhi", "bengaluru", "bangalore", "hyderabad",
            "chennai", "kolkata", "pune", "ahmedabad", "noida", "gurugram", "gurgaon",
            "faridabad", "ghaziabad", "thane", "navimumbai", "navi mumbai"
    );

    /** States / UTs where remote-column rates apply (north-east, islands, etc.). */
    private static final Set<String> REMOTE_STATES = Set.of(
            "arunachal pradesh", "assam", "manipur", "meghalaya", "mizoram", "nagaland",
            "tripura", "sikkim", "jammu and kashmir", "ladakh",
            "andaman and nicobar islands", "lakshadweep"
    );

    public ShippingZone resolve(Address address) {
        if (address == null) {
            return ShippingZone.NATIONAL;
        }
        String city = norm(address.getCity());
        String state = norm(address.getState());
        String oc = norm(originCity);
        String os = norm(originState);

        if (!city.isEmpty() && city.equals(oc)) {
            return ShippingZone.LOCAL;
        }
        if (!state.isEmpty() && state.equals(os) && !city.equals(oc)) {
            return ShippingZone.REGIONAL;
        }
        if (!state.isEmpty() && REMOTE_STATES.contains(state)) {
            return ShippingZone.REMOTE;
        }
        if (!city.isEmpty() && METRO_CITIES.contains(city)) {
            return ShippingZone.METRO;
        }
        return ShippingZone.NATIONAL;
    }

    private static String norm(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().toLowerCase(Locale.ROOT);
    }
}
