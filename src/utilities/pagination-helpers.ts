export function getLimitAndOffset({ page = 1, size = 10 }) {
  if (Number.isNaN(Number.parseInt(page.toString()))) {
    throw new TypeError('getPaginationObject Error: page must be a number.');
  }
  if (Number.isNaN(Number.parseInt(size.toString()))) {
    throw new TypeError('getPaginationObject Error: size must be a number.');
  }

  if (page < 1) {
    page = 1;
  }

  const limit = size;
  const offset = (page - 1) * size;

  return [limit, offset];
}

export function getPaginationObject({ page = 1, size = 10, total = 0 }) {
  if (Number.isNaN(Number.parseInt(page.toString()))) {
    throw new TypeError('getPaginationObject Error: page must be a number.');
  }
  if (Number.isNaN(Number.parseInt(size.toString()))) {
    throw new TypeError('getPaginationObject Error: size must be a number.');
  }
  if (Number.isNaN(Number.parseInt(total.toString()))) {
    throw new TypeError('getPaginationObject Error: total must be a number.');
  }

  if (page < 1) {
    page = 1;
  }

  const lastPage = Math.ceil(total / size);
  return {
    total,
    lastPage,
    prevPage: page > 1 ? page - 1 : null,
    nextPage: page < lastPage ? page + 1 : null,
    perPage: size,
    currentPage: page,
  };
}
