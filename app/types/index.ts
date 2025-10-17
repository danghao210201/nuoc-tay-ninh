// Định nghĩa types cho dữ liệu JSON

export interface LinhVuc {
  id: string;
  code: string | null;
  integratedCode: string | null;
  primaryColor: string | null;
  iconId: string;
  order: number;
  status: number;
  parentId: string | null;
  createdDate: string;
  name: string;
  description: string | null;
}

export interface Place {
  id: string;
  typeId: string;
  name: string;
}

export interface TakePlaceAt {
  latitude: number;
  longitude: number;
  fullAddress: string;
  place: Place[];
}

export interface Tag {
  id: string;
  parentId: string;
  name: string;
}

export interface Agency {
  id: string;
  name: string;
}

export interface ReceptionMethod {
  id: string;
  trans: {
    languageId: number;
    name: string;
  }[];
}

export interface FileItem {
  id: string;
  name: string;
  group: number[];
  updatedDate: string;
}

export interface PhanAnh {
  num: number;
  id: string;
  title: string;
  code: string;
  description: string;
  createdDate: string;
  dueDate: string;
  status: number;
  statusDescription: string;
  takePlaceAt: TakePlaceAt;
  thumbnailId: string;
  receptionMethod: ReceptionMethod;
  receptionMethodDescription: string;
  file: FileItem[];
  interestUsers: any[];
  interested: boolean;
  agency: Agency;
  tag: Tag;
  typeRequest?: string;
}

export interface PaginationInfo {
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  offset: number;
  pageNumber: number;
  pageSize: number;
  paged: boolean;
  unpaged: boolean;
}

export interface LinhVucResponse {
  content: LinhVuc[];
  pageable: PaginationInfo;
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface DanhSachPhanAnhResponse {
  content: PhanAnh[];
  pageable: PaginationInfo;
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}
