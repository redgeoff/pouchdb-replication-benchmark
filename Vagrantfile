Vagrant.configure("2") do |config|

  config.vm.box = "ubuntu/trusty64"

  # Use a private network so that we don't have to worry about forwarding ports
  config.vm.network "private_network", ip: "192.168.50.8"

  config.vm.provider "virtualbox" do |v|
    # Default of 512 MB is too little for an `npm install` -- TODO: still true?
    v.memory = 1024

    # Only allow drift of 1 sec, instead of 20 min default
    v.customize [ "guestproperty", "set", :id, "/VirtualBox/GuestAdd/VBoxService/--timesync-set-threshold", 1000 ]
  end

  # Bootstrap script for configuring VM
  config.vm.provision :shell, path: "bootstrap.sh"

end
