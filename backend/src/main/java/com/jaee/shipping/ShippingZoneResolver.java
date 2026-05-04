package com.jaee.shipping;

import com.jaee.entity.Address;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

/**
 * Maps a delivery address to a zone column from the carrier rate card.
 * Origin defaults to Wakad, Pune (Maharashtra) — tune via app.shipping.*.
 * Pune metro suburbs share the same “local” bucket as Wakad for tier selection.
 */
@Component
public class ShippingZoneResolver {

    @Value("${app.shipping.origin-city:Wakad}")
    private String originCity;

    @Value("${app.shipping.origin-state:Maharashtra}")
    private String originState;

    /** Pune metro area — same-day / local tier relative to a Wakad warehouse. */
    private static final Set<String> PUNE_METRO_CLUSTER = Set.of(
            "pune", "wakad", "hinjewadi", "pimpri", "chinchwad", "pimpri-chinchwad",
            "aundh", "baner", "kothrud", "viman nagar", "kharadi", "hadapsar", "wagholi",
            "pimple saudagar", "bhosari"
    );

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
        String os = norm(originState);

        if (!city.isEmpty() && isSameFulfillmentLocalArea(city)) {
            return ShippingZone.LOCAL;
        }
        if (!state.isEmpty() && state.equals(os) && !isSameFulfillmentLocalArea(city)) {
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

    /**
     * True when delivery city is the same as origin, or both sit in the Pune metro cluster
     * (warehouse in Wakad / Pune area).
     */
    private boolean isSameFulfillmentLocalArea(String cityNorm) {
        if (cityNorm.isEmpty()) {
            return false;
        }
        String o = norm(originCity);
        if (o.isEmpty()) {
            return false;
        }
        if (cityNorm.equals(o)) {
            return true;
        }
        return PUNE_METRO_CLUSTER.contains(o) && PUNE_METRO_CLUSTER.contains(cityNorm);
    }

    private static String norm(String s) {
        if (s == null) {
            return "";
        }
        return s.trim().toLowerCase(Locale.ROOT);
    }
}
