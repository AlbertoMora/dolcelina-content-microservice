import geoip from 'geoip-lite';

export const getLocationPattern = (ip: string | undefined) => {
    const ipGeo = geoip.lookup(ip ?? '');
    return ipGeo ? `${ipGeo.country}-${ipGeo.area}-${ipGeo.city}-${ipGeo.range}` : 'Unknown';
};
