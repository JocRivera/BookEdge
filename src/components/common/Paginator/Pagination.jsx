// Pagination.js
import React from "react";
import ReactPaginate from "react-paginate";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import "./Pagination.css";

function Pagination({ pageCount, onPageChange }) {
  return (
    <ReactPaginate
      previousLabel={<FiChevronLeft size={18} />}
      nextLabel={<FiChevronRight size={18} />}
      breakLabel={"..."}
      pageCount={pageCount}
      marginPagesDisplayed={1}
      pageRangeDisplayed={3}
      onPageChange={onPageChange}
      containerClassName={"pagination"}
      pageClassName={"page-item"}
      pageLinkClassName={"page-link"}
      activeClassName={"active"}
      previousClassName={"previous"}
      nextClassName={"next"}
      breakClassName={"break"}
      disabledClassName={"disabled"}
    />
  );
}

export default Pagination;