//*******************************************************************
// Point
var Point = function(z,x,y) {
    this.z = z;
    this.x = x;
    this.y = y;
}

//*******************************************************************
// Room
var Room = function(map_floors, map_width, map_height) {
    this.map_width = map_width;
    this.map_height = map_height;
    this.map_floors = map_floors;
    var half_width = (map_width-1)/2
    var half_height = (map_height-1)/2
    var half_floors = (map_floors-1)/2

    this.width = Math.floor(Math.random() * 3) + 1;
    this.height = Math.floor(Math.random() * 3) + 1;
    this.floors = Math.floor(Math.random() * 2);
    this.x = Math.floor(Math.random() * (half_width - this.width)),
    this.y = Math.floor(Math.random() * (half_height - this.height)),
    this.z = Math.floor(Math.random() * (half_floors - this.floors)),

    this.width = this.width * 2 + 1;
    this.height = this.height * 2 + 1;
    this.floors = this.floors * 2 + 1;
    this.x = this.x * 2 + 1;
    this.y = this.y * 2 + 1;
    this.z = this.z * 2 + 1;
}

Room.prototype.check_collisions = function(map) {
    for(z=this.z; z<(this.z+this.floors); z+=2) {
        for(x=this.x; x<(this.x+this.width); x+=2) {
            for(y=this.y; y<(this.y+this.height); y+=2) {
                if(map[z][x][y] == 0) {
                    return false;
                }
            }
        }
    }
    return true;
}

Room.prototype.draw = function(map) {
    for(z=this.z; z<(this.z+this.floors); z++) {
        for(x=this.x; x<(this.x+this.width); x++) {
            for(y=this.y; y<(this.y+this.height); y++) {
                map[z][x][y] = 0;
            }
        }
    }
}

Room.prototype.create_doors = function(map) {
    var possible_doors = [];
    var doors_to_open = Math.floor(Math.random()*3) + 1;
    var z = this.z + this.floors - 1;

    for(x=this.x-1; x<this.x+this.width+1; x++) {
        if(x % 2 == 1) {
            if(this.y-1 != 0) {
                if(map[z][x][this.y-1] == 0) {
                    doors_to_open--;
                }
                else {
                    possible_doors.push(new Point(z,x,this.y-1));
                }
            }

            if(this.y+this.height != this.map_height-1) {
                if(map[z][x][this.y+this.height] == 0) {
                    doors_to_open--;
                }
                else {
                    possible_doors.push(new Point(z,x,this.y+this.height));
                }
            }
        }

        if(map[z][x][this.y-1] == 1) {
            map[z][x][this.y-1] = 2;
        }
        if(map[z][x][this.y+this.height] == 1) {
            map[z][x][this.y+this.height] = 2;
        }
    }

    for(y=this.y-1; y<this.y+this.height+1; y++) {
        if(y % 2 == 1) {
            if(this.x-1 != 0) {
                if(map[z][this.x-1][y] == 0) {
                    doors_to_open--;
                }
                else {
                    possible_doors.push(new Point(z,this.x-1,y));
                }
            }

            if(this.x+this.width != this.map_width-1) {
                if(map[z][this.x+this.width][y] == 0) {
                    doors_to_open--;
                }
                else {
                    possible_doors.push(new Point(z,this.x+this.width,y));
                }
            }
        }

        if(map[z][this.x-1][y] == 1) {
            map[z][this.x-1][y] = 2;
        }
        if(map[z][this.x+this.width][y] == 1) {
            map[z][this.x+this.width][y] = 2;
        }
    }

    while(doors_to_open > 0) {
        var d = possible_doors.splice(Math.floor(Math.random()*possible_doors.length), 1);
        map[z][d[0].x][d[0].y] = 0;
        doors_to_open--;
    }
}

//*******************************************************************
// Functions
function generateMap(z_len, x_len, y_len) {
    // Fill the map with walls
    var map = [];
    for(z=0; z<z_len; z++) {
        map[z] = []
        for(x=0; x<x_len; x++) {
            map[z][x] = []
            for(y=0; y<y_len; y++) {
                map[z][x][y] = 1;
            }
        }
    }

    // Add rooms
    var tries = 20;
    var rooms_to_create = (x_len*y_len)/25;
    while(rooms_to_create > 0) {
        var room = new Room(z_len, x_len, y_len);
        if(room.check_collisions(map)) {
            tries = 20;
            room.draw(map);
            room.create_doors(map);
            rooms_to_create--;
        }
        else {
            tries--;
            if(tries == 0){break;}
        }
    }

    // Generate hallways
    for(z=1; z<z_len; z+=2) {
        for(x=1; x<x_len; x+=2) {
            for(y=1; y<y_len; y+=2) {
                if(map[z][x][y] == 1) {
                    generateTunnel(map, z, x, y);
                }
            }
        }
    }

    return map;
}

function generateTunnel(map, start_z, start_x, start_y)
{
    var floors = map.length;
    var width = map[0].length;
    var height = map[0][0].length;

    var stack = new Array();
    var cursor = [new Point(start_z, start_x, start_y), new Point(start_z, start_x, start_y)]; // Cursor
    stack.push(cursor);

    while(stack.length != 0)
    {
        var neighbors = new Array();
        var cur = cursor[0];

        // Create a list of possible neighbors
        if(cur.z-2 > 0 && map[cur.z-2][cur.x][cur.y]==1)
        {
            neighbors.push([new Point(cur.z-2,cur.x,cur.y), new Point(cur.z-1,cur.x,cur.y)]);
        }
        if(cur.z+2 < floors-1 && map[cur.z+2][cur.x][cur.y]==1)
        {
            neighbors.push([new Point(cur.z+2,cur.x,cur.y), new Point(cur.z+1,cur.x,cur.y)]);
        }
        if(cur.x-2 > 0 && map[cur.z][cur.x-2][cur.y]==1)
        {
            neighbors.push([new Point(cur.z,cur.x-2,cur.y), new Point(cur.z,cur.x-1,cur.y)]);
        }
        if(cur.x+2 < width-1 && map[cur.z][cur.x+2][cur.y]==1)
        {
            neighbors.push([new Point(cur.z,cur.x+2,cur.y), new Point(cur.z,cur.x+1,cur.y)]);
        }
        if(cur.y-2 > 0 && map[cur.z][cur.x][cur.y-2]==1)
        {
            neighbors.push([new Point(cur.z,cur.x,cur.y-2), new Point(cur.z,cur.x,cur.y-1)]);
        }
        if(cur.y+2 < height-1 && map[cur.z][cur.x][cur.y+2]==1)
        {
            neighbors.push([new Point(cur.z,cur.x,cur.y+2), new Point(cur.z,cur.x,cur.y+1)]);
        }

        // If there are no possible neighbors, go back in the stack
        if(neighbors.length == 0)
        {
            // Check for dead-end
            var openings = 0;
            walls = [
                map[cur.z+1][cur.x][cur.y],
                map[cur.z-1][cur.x][cur.y],
                map[cur.z][cur.x+1][cur.y],
                map[cur.z][cur.x-1][cur.y],
                map[cur.z][cur.x][cur.y+1],
                map[cur.z][cur.x][cur.y-1]
            ];
            for(var i=0; i<6; i++) {
                if(walls[i] == 0){ openings++; }
            }
            if(openings <= 1) {
                // Block dead end
                map[cursor[0].z][cursor[0].x][cursor[0].y] = 3;
                map[cursor[1].z][cursor[1].x][cursor[1].y] = 3;
            }

            cursor = stack.pop();
        }
        else
        {
            var choice = 0;
            // Choose a random neighbor
            if(neighbors.length > 1)
            {
                choice = Math.floor(Math.random()*neighbors.length);
            }

            map[neighbors[choice][1].z][neighbors[choice][1].x][neighbors[choice][1].y] = 0;
            map[neighbors[choice][0].z][neighbors[choice][0].x][neighbors[choice][0].y] = 0;
            stack.push(cursor);
            cursor = neighbors[choice];
        }
    }
}
