export type AssetType = "template";

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  imageDataUrl: string;
  createdAt: string;
};
