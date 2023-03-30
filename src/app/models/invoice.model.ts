export interface Invoice {
    id: number;
    sku?: string;
    date?: string;
    year: number;
    month: number;
    type: string;
    sum?: number;
    adjustedSum?: number;
    mean?: number;
    max?: number;
    min?: number;
    confidenceLevel?: number;
    upperBound?: number;
    lowerBound?: number;
    filterList?: String;
    stationarity?: string;
    cluster?: number;
    application?: string;
    itemGroupDefault?: string;
    bestModel?: string;
}