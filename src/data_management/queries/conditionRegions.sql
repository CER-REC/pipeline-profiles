SELECT
[Region_SKey] as [id],
rtrim(ltrim([RegionEnglish])) as [e],
rtrim(ltrim([RegionFrench])) as [f]
FROM [Regulatory_Untrusted].[B-05584].[Region]