declare module "*.json" {
  const value: any;
  export default value;
}

declare module "../../mock-data/linh-vuc.json" {
  import type { LinhVucResponse } from "./types";
  const value: LinhVucResponse;
  export default value;
}

declare module "../../mock-data/danh-sach-phan-anh.json" {
  import type { DanhSachPhanAnhResponse } from "./types";
  const value: DanhSachPhanAnhResponse;
  export default value;
}
