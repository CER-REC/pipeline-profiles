SELECT
[Theme_Id] as [id],
rtrim(ltrim([ThemeEnglishName])) as [e],
rtrim(ltrim([ThemeFrenchName])) as [f]
FROM [Regulatory_Untrusted].[B-05584].[Theme]