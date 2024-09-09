import { Link } from "react-router-dom";
import { Fragment } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { IoIosArrowDown } from "react-icons/io";
import { useState } from "react";

const loggedInNavItems = [
  { name: "Shift", href: "/shift" },
  { name: "Jadwal", href: "/jadwal-kehadiran" },
  { name: "Kehadiran", href: "/kehadiran" },
  { name: "Absen", href: "/presensi" },
  { name: "Gaji Pershift", href: "/rekap-gaji" },
  { name: "Gaji Perdokter", href: "/rekap-gaji-dokter" },
  { name: "Shift Perawat Gigi", href: "/rekap-shift-perawat-gigi" },
  { name: "Rekap Gaji Perawat Gigi", href: "/rekap-periode-perawat-gigi" },
  { name: "Shift Perawat Umum", href: "/rekap-shift-perawat-umum" },
];

// List of nav items to be displayed if not logged in
const notLoggedInNavItems = [
  { name: "Kehadiran", href: "/kehadiran" },
  { name: "Absen", href: "/presensi" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const Navigation = () => {
  const isLoggedIn = sessionStorage.getItem("user");

  const [dropdown, setDropdown] = useState(false);
  return (
    <Disclosure as="nav" className="bg-gray-800">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <img
                    className="h-8 w-auto"
                    src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500"
                    alt="Your Company"
                  />
                </div>
                <div className="hidden sm:ml-6 sm:block">
                  <div className="flex space-x-4">
                    {isLoggedIn
                      ? loggedInNavItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={classNames(
                              "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "rounded-md px-3 py-2 text-sm font-medium"
                            )}>
                            {item.name}
                          </Link>
                        ))
                      : notLoggedInNavItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={classNames(
                              "text-gray-300 hover:bg-gray-700 hover:text-white",
                              "rounded-md px-3 py-2 text-sm font-medium"
                            )}>
                            {item.name}
                          </Link>
                        ))}
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"></div>
            </div>
          </div>

          <Disclosure.Panel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {isLoggedIn
                ? loggedInNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}>
                      {item.name}
                    </Link>
                  ))
                : notLoggedInNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={classNames(
                        "text-gray-300 hover:bg-gray-700 hover:text-white",
                        "rounded-md px-3 py-2 text-sm font-medium"
                      )}>
                      {item.name}
                    </Link>
                  ))}
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};

export default Navigation;
